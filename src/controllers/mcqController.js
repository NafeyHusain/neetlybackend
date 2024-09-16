const { generateMCQs } = require("../services/openaiService");

/**
 * @swagger
 * /api/mcq/generate:
 *   post:
 *     summary: Generate MCQs
 *     tags: [MCQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *               numberOfQuestions:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully generated MCQs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Topic is required
 *       500:
 *         description: An error occurred while generating MCQs
 */
exports.generateMCQ = async (req, res) => {
    try {
        const { topic, numberOfQuestions } = req.body;
        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const mcqs = await generateMCQs(topic, numberOfQuestions || 15);
        res.json(mcqs);
    } catch (error) {
        console.error("Error in generateMCQ:", error);
        res.status(500).json({ error: "An error occurred while generating MCQs" });
    }
};
