const { generateMCQs } = require("../services/geminiAiService.js");
const Question = require("../models/question");
const { generateTextMessage } = require("../lib/gemini");

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

        const mcqs = await generateMCQs(topic, numberOfQuestions || 5);
        res.json(mcqs);
    } catch (error) {
        console.error("Error in generateMCQ:", error);
        res.status(500).json({ error: "An error occurred while generating MCQs" });
    }
};


exports.createAISuggestion = async (req, res) => {
    const userId = req.auth.userId;
    const mcqSetId = req.params.id;
    try {
        const userData = await Question.findOne({ _id: mcqSetId, userId });
    // Find the MCQ set
    const mcqSet = userData.history[0];
      if (!userData) {
        return res.status(404).json({ message: 'User data not found' });
      }

      if (!mcqSet) {
        return res.status(404).json({ message: 'MCQ set not found' });
      }
  
      const incorrectQuestions = mcqSet.questionData.filter((question) => {
        const userAnswers = question.userAnswer?.sort().join(',');
        const correctAnswers = question.correct?.sort().join(',');
        return userAnswers !== correctAnswers;
    });
      if (incorrectQuestions.length === 0) {
        return res.status(200).json({ message: 'Excellent! All answers are correct.' });
      }
  const analysisData = incorrectQuestions.map((question) => ({
      question: question.text,
      userAnswer: question.userAnswer,
      correctAnswer: question.correct,
      explanation: question.explanation,
      subject: question.subject || 'General',
    }));
    const prompt = generateLLMPrompt(analysisData);
    const llmResponse = await generateTextMessage(prompt);
    return res.status(200).json({ suggestion: llmResponse });
 
    } catch (error) {
        console.error("Error in generating Suggestions:", error);
        res.status(500).json({ error: "Error in generating Suggestions:" });
    }
};


function generateLLMPrompt(analysisData) {
    let prompt = 'The Bachelor of Medicine, Bachelor of Surgery professional made the following mistakes:\n';
  
    analysisData.forEach((data, index) => {
      prompt += `
  Question ${index + 1}:
  Question Text: ${data.question}
  User's Answer: ${data.userAnswer.join(', ')}
  Correct Answer: ${data.correctAnswer.join(', ')}
  Explanation: ${data.explanation}
  Subject: ${data.subject}\n`;
    });
  
    prompt += `
  Based on these mistakes, provide detailed suggestions on where the professionl/student lacks and how they can improve. Focus on specific topics and concepts they should revisit.`;
  
    return prompt;
  }
