const { generateTextMessage } = require("../lib/gemini");

exports.generateText = async (req, res) => {
    try {
        const { topic } = req.body;
        console.log(topic);
        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const mcqs = await generateTextMessage(topic);
        res.json(mcqs);
    } catch (error) {
        console.error("Error in generateMCQ:", error);
        res.status(500).json({ error: "An error occurred while generating MCQs" });
    }
};
