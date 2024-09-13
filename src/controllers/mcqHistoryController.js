const Question = require("../models/question");

const UserQuestions = require("../models/questionChat");

/**
 * @swagger
 * /api/mcq-history:
 *   post:
 *     summary: Save MCQ history for a user
 *     tags: [MCQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: MCQ history saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
exports.mcqHistory = async (req, res) => {
    const userId = 1234;
    try {
        // Assuming req.body contains the quiz data
        const { topic, totalQuestions, questionData, marks } = req.body;

        console.log(topic, totalQuestions, questionData, marks);
        // Find the existing document for the user, or create a new one if it doesn't exist
        let userQuestion = new Question({ userId, history: [] });

        // Create a new history entry
        const newHistoryEntry = {
            topic,
            totalQuestions: totalQuestions,
            marks,
            questionData: questionData.map((q) => ({
                text: q.text,
                type: q.type,
                options: q.options,
                correct: q.correct,
                explanation: q.explanation,
                subject: q.subject || "not defined",
                userAnswer: q.userAnswer || [],
            })),
        };

        // Add the new history entry to the user's history
        userQuestion.history.push(newHistoryEntry);

        // Save the updated document
        const savedQuestions = await userQuestion.save();

        // CHECK IF THE USERCHATS EXISTS
        const userQuestions = await UserQuestions.find({ userId: userId });

        if (!userQuestions.length) {
            const newUserQuestions = new UserQuestions({
                userId: userId,
                questions: [
                    {
                        _id: savedQuestions._id,
                        title: newHistoryEntry.topic,
                    },
                ],
            });

            await newUserQuestions.save();
        } else {
            // IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
            await UserQuestions.updateOne(
                { userId: userId },
                {
                    $push: {
                        questions: {
                            _id: savedQuestions._id,
                            title: newHistoryEntry.topic,
                        },
                    },
                }
            );
        }

        res.status(200).json({ message: "MCQ history saved successfully", id: userQuestion._id });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error creating chat!");
    }
};

exports.mcqHistoryWithId = async (req, res) => {
    const userId = 1234;

    try {
        const chat = await Question.findOne({ _id: req.params.id, userId });

        res.status(200).send(chat);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching chat!");
    }
};

exports.userMcqHistory = async (req, res) => {
    const userId = 1234;
    try {
        const userQuestions = await UserQuestions.find({ userId });
        console.log(userQuestions[0].questions);
        res.status(200).send("userQuestions[0].questions");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching userchats!");
    }
};

exports.updateMcqHistoryWithId = async (req, res) => {
    const userId = req.auth.userId;
    console.log(req.body);
    const { topic, totalQuestions, questionData, marks } = req.body;

    try {
        const updatedMcqHistory = await Question.updateOne(
            { _id: req.params.id, userId },
            {
                $push: {
                    history: {
                        topic,
                        totalQuestions,
                        marks,
                        questionData: questionData.map((q) => ({
                            text: q.text,
                            type: q.type,
                            options: q.options,
                            correct: q.correct,
                            explanation: q.explanation,
                            subject: q.subject || "not defined",
                            userAnswer: q.userAnswer || [],
                        })),
                    },
                },
            }
        );
        res.status(200).json(updatedMcqHistory);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating MCQ history!");
    }
};
