const { generateTextMessage } = require("../lib/gemini");

const { generateTextMessageOpenAI } = require("../lib/openAI");

exports.generateText = async (req, res) => {
    try {
        let prompt = [];
        if (req.body.payload.data.length === 1) {
            let text = req.body.payload.data[0];
            prompt = [
                "Consider yourself expert in medical science and you are trying to explain it to a scientist and answer the question " +
                    text,
            ];
        } else {
            let text = req.body.payload.data[1];
            text =
                "Consider yourself expert in medical science and you are trying to explain it to a scientist and answer the question " +
                text;
            prompt = [req.body.payload.data[0], text];
        }

        if (!prompt) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const mcqs = await generateTextMessage(prompt);
        res.json(mcqs);
    } catch (error) {
        console.error("Error in generateMCQ:", error);
        res.status(500).json({ error: "An error occurred while generating MCQs" });
    }
};

exports.generateTextOpenAI = async (req, res) => {
    try {
        let prompt = [];
        if (req.body.payload.data.length === 1) {
            let text = req.body.payload.data[0];
            prompt = [
                "Consider yourself expert in medical science and you are trying to explain it to a scientist and answer the question " +
                    text,
            ];
        } else {
            let text = req.body.payload.data[1];
            text =
                "Consider yourself expert in medical science and you are trying to explain it to a scientist and answer the question " +
                text;
            prompt = [req.body.payload.data[0], text];
        }

        if (!prompt) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const mcqs = await generateTextMessageOpenAI(prompt);
        res.json(mcqs);
    } catch (error) {
        console.error("Error in generateMCQ:", error);
        res.status(500).json({ error: "An error occurred while generating MCQs" });
    }
};
