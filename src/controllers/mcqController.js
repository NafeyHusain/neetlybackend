const { generateMCQs } = require("../services/openaiService");

exports.generateMCQ = async (req, res) => {
    try {
        const { topic, numberOfQuestions } = req.body;
        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const mcqs = await generateMCQs(topic, numberOfQuestions || 5);
        res.json(mcqs);
    } catch (error) {
        console.error("Error in generateMCQ:", error);
        res.status(500).json({ error: "An error occurred while generating MCQs" });
    }
};
