const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
];

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, safetySettings);

const chat = model.startChat({
    history: [
        {
            role: "user",
            parts: [
                {
                    text: "Assume that you are experienced medical expert in medical science ,you are a professional , well trained doctor",
                },
            ],
        },
        {
            role: "model",
            parts: [
                {
                    text: "you are capable fo generating high quality content on medical exam prepartion case studies ,mcq's",
                },
            ],
        },
    ],
    generationCOnfig: {
        //   maxOutputTokens: 100,
    },
});

const mcqModel = model.startChat({
    history: [
        {
            role: "user",
            parts: [
                {
                    text: "Assume that you are experienced medical expert in medical science ,you are a professional , well trained doctor ",
                },
            ],
        },
        {
            role: "model",
            parts: [
                {
                    text: "you are capable of generating expert level  content on medical  case studies and medical exam prepartion mulitple choice questions for people practising medicine and the questions you generate should be tough and hard",
                },
            ],
        },
    ],
    generationCOnfig: {
        //   maxOutputTokens: 100,
    },
});

async function generateTextMessage(topic) {
    try {
        //   const prompt = `${topic}`;
        const result = await chat.sendMessageStream(topic);
        // Assuming a method like generateText exists on the model object
        //   const response = await model.generateContent({
        //       prompt,
        //   });
        let accumulatedText = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();

            accumulatedText += chunkText;
        }
        const response = await result.response;
        const text = accumulatedText;

        const jsonMatch = text;
        if (jsonMatch) {
            try {
                return jsonMatch;
            } catch {
                console.error("Error parsing extracted JSON:");
                throw new Error("Failed to parse MCQ data from API response");
            }
        } else {
            console.error("No JSON array found in the content");
            throw new Error("Invalid response format from API");
        }
    } catch (error) {
        console.error("Error generating MCQs:", error.response?.data || error.message);
        throw error;
    }
}

async function generateMultipleChoice(topic) {
    try {
        //   const prompt = `${topic}`;
        const result = await mcqModel.sendMessageStream(topic);
        // Assuming a method like generateText exists on the model object
        //   const response = await model.generateContent({
        //       prompt,
        //   });
        let accumulatedText = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();

            accumulatedText += chunkText;
        }
        const response = await result.response;
        const text = accumulatedText;

        const jsonMatch = text;
        if (jsonMatch) {
            try {
                return jsonMatch;
            } catch {
                console.error("Error parsing extracted JSON:");
                throw new Error("Failed to parse MCQ data from API response");
            }
        } else {
            console.error("No JSON array found in the content");
            throw new Error("Invalid response format from API");
        }
    } catch (error) {
        console.error("Error generating MCQs:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { generateTextMessage };
