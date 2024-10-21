const Question = require("../models/question");

const UserQuestions = require("../models/questionChat");

/**
 * @swagger
 * /api/mcq/mcqHistory:
 *   post:
 *     summary: Save MCQ history for a user
 *     tags: [MCQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               totalQuestions:
 *                 type: integer
 *               questionData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     type:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correct:
 *                       type: array
 *                       items:
 *                         type: string
 *                     explanation:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     userAnswer:
 *                       type: array
 *                       items:
 *                         type: string
 *               marks:
 *                 type: integer
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
    const userId = req.auth.userId;
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

/**
 * @swagger
 * /api/mcq/questHistory/{id}:
 *   get:
 *     summary: Get MCQ history by ID
 *     tags: [MCQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the MCQ history to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: MCQ history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       topic:
 *                         type: string
 *                       totalQuestions:
 *                         type: integer
 *                       marks:
 *                         type: integer
 *                       questionData:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             text:
 *                               type: string
 *                             type:
 *                               type: string
 *                             options:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             correct:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             explanation:
 *                               type: string
 *                             subject:
 *                               type: string
 *                             userAnswer:
 *                               type: array
 *                               items:
 *                                 type: string
 *       404:
 *         description: MCQ history not found
 *       500:
 *         description: Server error
 */
exports.mcqHistoryWithId = async (req, res) => {
    const userId = req.auth.userId;

    try {
        const chat = await Question.findOne({ _id: req.params.id, userId });

        res.status(200).send(chat);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching chat!");
    }
};

/**
 * @swagger
 * /api/mcq/userMcqHistory:
 *   get:
 *     summary: Get MCQ history for the authenticated user
 *     tags: [MCQ]
 *     responses:
 *       200:
 *         description: User's MCQ history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
exports.userMcqHistory = async (req, res) => {
    const userId = req.auth.userId;
    try {
        const userQuestions = await UserQuestions.find({ userId });
        console.log(userQuestions[0].questions);
        const questionsArray = [...userQuestions[0].questions];
        res.status(200).send(questionsArray);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching userchats!");
    }
};


exports.subjectWiseMcq = async (req, res) => {
    const userId = req.auth.userId;
  
    try {
      // Fetch all user question history documents
      const userQuestionData = await Question.find({ userId }).lean();
  
      if (!userQuestionData || userQuestionData.length === 0) {
        return res.status(404).json({ message: 'No MCQ sets found for the user' });
      }
  
      // Initialize an empty array to collect subjects
      const subjects = [];
  
      // Iterate over each user's data document
      userQuestionData.forEach((userData) => {
        if (!userData.history) {
          return;
        }
  
        // Iterate over each topic in the history array
        userData.history.forEach((topicData) => {
          if (!topicData.questionData) {
            return;
          }
  
          const correctAnswersCount = topicData.questionData.filter((q) =>
            q.correct?.sort().join() === q.userAnswer?.sort().join()
          ).length;
  
          const successRate = Math.round((correctAnswersCount / topicData.totalQuestions) * 100);
  
          const mcqSet = {
            uuid: userData._id.toString(),
            setName: `${topicData.topic} Set 1`,
            solvedQuestions: topicData.questionData.length,
            totalQuestions: topicData.totalQuestions,
            successRate,
            canReattempt: successRate < 100,
          };
  
          const subjectName = topicData.questionData[0]?.subject || 'General';
          let subject = subjects.find((s) => s.subject === subjectName);
          if (!subject) {
            subject = {
              subject: subjectName,
              topics: [],
            };
            subjects.push(subject);
          }
  
          let topic = subject.topics.find((t) => t.name === topicData.topic);
          if (!topic) {
            topic = {
              name: topicData.topic,
              mcqSets: [],
            };
            subject.topics.push(topic);
          }
          topic.mcqSets.push(mcqSet);
        });
      });
  
      res.status(200).json(subjects);
    } catch (error) {
      console.error('Error fetching MCQ set metadata:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  


/**
 * @swagger
 * /api/mcq/questHistory/{id}:
 *   put:
 *     summary: Update MCQ history by ID
 *     tags: [MCQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the MCQ history to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               totalQuestions:
 *                 type: integer
 *               questionData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     type:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correct:
 *                       type: array
 *                       items:
 *                         type: string
 *                     explanation:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     userAnswer:
 *                       type: array
 *                       items:
 *                         type: string
 *               marks:
 *                 type: integer
 *     responses:
 *       200:
 *         description: MCQ history updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: MCQ history not found
 *       500:
 *         description: Server error
 */
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

exports.updateMcqHistoryDataWithId = async (req, res) => {
    const userId = req.auth.userId;
    console.log(req.body);
    const { topic, totalQuestions, questionData, marks } = req.body;
  
    const newHistoryEntry = {
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
    };
  
    try {
      const updatedMcqHistory = await Question.updateOne(
        { _id: req.params.id, userId },
        {
          $set: {
            'history.0': newHistoryEntry,
          },
        }
      );
      res.status(200).json(updatedMcqHistory);
    } catch (err) {
      console.log(err);
      res.status(500).send("Error updating MCQ history!");
    }
  };
  