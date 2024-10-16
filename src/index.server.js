const express = require("express");
const env = require("dotenv");
const app = express();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const mcqRoutes = require("./routes/mcqRoutes");
const chatHistoryRoutes = require("./routes/chatHistoryRoutes");
const textRoutes = require("./routes/textAnswersRoutes.js");
const openAIRoutes = require("./routes/openAI/answerGeneratorOpenAI.js");

const textEmbeddingRoutes = require("./routes/openAI/textEmbeddingRoutes.js");

const mcqHistoryRoutes = require("./routes/mcqHistoryRoutes.js");
const ImageKit = require("imagekit");
const cors = require("cors");

// environment variable or  constant

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLICKEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE,
});

env.config();

app.use(
    cors({
        origin: [
            process.env.CLIENT_URL,
            "http://localhost:3000",
            "https://www.neetlyai.in/",
            "https://www.neetlyai.in",
            "https://neetlybackend.vercel.app",
            "https://neetly-frontend.vercel.app",
        ],
        credentials: true,
    })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(401).send("Unauthenticated!");
});

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Your API",
            version: "1.0.0",
            description: "API documentation for your backend",
        },
        servers: [
            {
                url: `https://neetlybackend.vercel.app`,
            },
        ],
    },
    apis: ["src/controllers/*.js"],
};

const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@neetlyai.ahpac.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority&appName=Neetlyai`;

// Connect to MongoDB
mongoose
    .connect(uri)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use("/api", userRoutes);
app.use("/api", chatHistoryRoutes);
app.use("/api", textRoutes);
app.use("/api/openAI", openAIRoutes);

app.use("/api/mcq", mcqRoutes);
app.use("/api", mcqHistoryRoutes);

// ******************

app.use("/api/", textEmbeddingRoutes);

app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
});

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
