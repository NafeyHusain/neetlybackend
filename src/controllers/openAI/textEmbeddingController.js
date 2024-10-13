const axios = require("axios");
const mysql = require("mysql2/promise");
const moment = require("moment");
const OpenAIApi = require("openai"); // Import OpenAI

// Initialize OpenAI API with your key
const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});

const pool = mysql.createPool({
    host: process.env.SINGLESTORE_HOST,
    port: process.env.SINGLESTORE_PORT,
    user: process.env.SINGLESTORE_USER,
    password: process.env.SINGLESTORE_PASSWORD,
    database: process.env.SINGLESTORE_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true, // SSL configuration, if required
    },
});

const openaiapi = axios.create({
    baseURL: "https://api.openai.com/v1",
    headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
});

// Helper function to generate OpenAI embeddings
async function generateEmbedding(text) {
    try {
        const response = await openaiapi.post("/embeddings", {
            model: "text-embedding-3-small", // Use the embedding model
            input: text,
        });
        console.log("################################################################");
        console.log(response.data.data[0].embedding);
        return response.data.data[0].embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw new Error("Failed to generate embedding");
    }
}

// Insert embeddings into the database
async function storeEmbedding(statement, embedding, category, source, createdAt, author) {
    try {
        const query =
            "INSERT INTO pgneetdata (text, vector,category,source,createdAt, author) VALUES (?, JSON_ARRAY_PACK(?),?,?,?,?)";
        const conn = await pool.getConnection();
        await conn.query(query, [statement, JSON.stringify(embedding), category, source, createdAt, author]);
        conn.release();
    } catch (error) {
        console.error("Error storing embedding:", error);
        throw new Error("Failed to store embedding");
    }
}

async function retryConnection(retries = 3, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await pool.getConnection();
        } catch (error) {
            if (i === retries - 1) throw error; // Rethrow if it's the last attempt
            console.warn(`Connection failed. Retrying in ${delay}ms...`);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
}

function formatResults(queryResult) {
    return {
        query: queryResult.query,
        matches: queryResult.results.map((result) => ({
            match: result.text,
            similarity: `${(result.similarity * 100).toFixed(2)}%`,
        })),
    };
}

async function generateAnswer(question, relevantText) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
            {
                role: "system",
                content:
                    "You are an experienced medical expert in medical science, a professional, well-trained doctor capable of generating expert-level content on medical case studies and detailed explanations for scientists.",
            },
            {
                role: "user",
                content: `You are capable of generating expert level content on medical case studies and detailed explanations for a scientist.Based on the following text, generate Multiple choice question: ${question}\n\n Text: ${relevantText}`,
            },
        ],
    });

    return response.choices[0].message.content;
}

async function generateExplanation(question, relevantText) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
            {
                role: "system",
                content:
                    "You are an experienced medical expert and well-trained doctor capable of generating expert-level content on medical case studies and detailed explanations for scientists.",
            },
            {
                role: "user",
                content: `You are a doctor and medical research professional .Based on the following text Text: ${relevantText} generate as detailed summary as possible for question : ${question}`,
            },
        ],
    });

    return response.choices[0].message.content;
}

async function findRelevantText(question) {
    console.log("question");
    console.log(question);
    const questionEmbedding = await generateEmbedding(question);
    const connection = await pool.getConnection();

    const searchQuery = `
        SELECT text, 
               dot_product(vector, JSON_ARRAY_PACK(?)) AS score,category,source,author
        FROM pgneetdata
        WHERE score > 0.75
        ORDER BY score DESC
        LIMIT 5;
        `;

    // Serialize the questionEmbedding array into a JSON string
    const embeddingAsJson = JSON.stringify(questionEmbedding);

    // Execute the query, passing the JSON string as a parameter
    const [rows] = await connection.execute(searchQuery, [embeddingAsJson]);

    connection.release();

    // const [rows] = await connection.query(searchQuery, [Buffer.from(Float32Array.from(questionEmbedding).buffer)]);
    // const [rows] = await connection.execute(searchQuery, [questionEmbedding]);

    //     await connection.query(searchQuery, [Buffer.from(Float32Array.from(questionEmbedding).buffer)]);
    console.log("**************");
    console.log("rows.length");
    console.log(rows.length);
    console.log(rows);
    return rows.length ? rows[0] : null;
}

exports.storeEmbeddingText = async (req, res) => {
    const { statement, category, source, author } = req.body;
    const metadata = JSON.stringify(req.body.metadata);

    try {
        // Step 1: Generate the embedding for the input statement
        const embedding = await generateEmbedding(statement);
        const createdAt = moment().format("YYYY-MM-DD HH:mm:ss"); // Get current timestamp in ISO format

        // Step 2: Store the embedding in the database
        await storeEmbedding(statement, embedding, category, source, createdAt, author, metadata);

        // Step 3: Respond with success
        res.status(200).json({ message: "Embedding stored successfully!" });
    } catch (error) {
        console.error("Error storing embedding:", error);
        res.status(500).json({ error: "Failed to store embedding" });
    }
};

async function storeEmbedding(statement, embedding, category, source, createdAt, author, metadata) {
    try {
        const query =
            "INSERT INTO pgneetdata (text, vector, category, source, createdAt, author,metadata) VALUES (?, JSON_ARRAY_PACK(?), ?, ?, ?, ?,?)";

        const conn = await pool.getConnection();

        await conn.query(query, [statement, JSON.stringify(embedding), category, source, createdAt, author, metadata]);

        conn.release(); // Release the connection back to the pool
    } catch (error) {
        console.error("Error storing embedding:", error);
        throw new Error("Failed to store embedding");
    }
}

exports.generateEmbeddedText = async (req, res) => {
    const { question } = req.body;
    try {
        // Step 1: Generate the embedding for the input statement
        const relevantText = await findRelevantText(question);
        console.log("*****************");
        console.log(relevantText);
        // Step 2: Search for the most similar embeddings in the database
        if (!relevantText) {
            return res.status(404).json({ error: "No relevant text found." });
        }

        //   Step 7.2: Generate an answer
        const results = await generateExplanation(question, relevantText.text);

        // Step 7.3: Return the answer
        // res.json({ relevantText });
        res.json({ query: question, results, category: relevantText.category, sources: relevantText.source });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to process the request" });
    }
};
