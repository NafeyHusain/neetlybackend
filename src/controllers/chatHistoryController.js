const Chat = require("../models/chat");

const UserChats = require("../models/userChats");

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: ID of the created chat
 *       500:
 *         description: Error creating chat
 */
exports.chatsHistory = async (req, res) => {
    // const userId = 1234567;
    const userId = req.auth.userId;

    const { text } = req.body;

    try {
        // CREATE A NEW CHAT
        const newChat = new Chat({
            userId: userId,
            // history: [{ role: "user", parts: [{ text }] }],
        });

        const savedChat = await newChat.save();

        // CHECK IF THE USERCHATS EXISTS
        const userChats = await UserChats.find({ userId: userId });

        // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
        if (!userChats.length) {
            const newUserChats = new UserChats({
                userId: userId,
                chats: [
                    {
                        _id: savedChat._id,
                        title: text.substring(0, 40),
                    },
                ],
            });

            await newUserChats.save();
        } else {
            // IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
            await UserChats.updateOne(
                { userId: userId },
                {
                    $push: {
                        chats: {
                            _id: savedChat._id,
                            title: text.substring(0, 40),
                        },
                    },
                }
            );

            res.status(201).send(newChat._id);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error creating chat!");
    }
};

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get user's chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's chats
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
 *       500:
 *         description: Error fetching userchats
 */
exports.userChats = async (req, res) => {
    // const userId = 1234567;
    const userId = req.auth.userId;

    console.log(req.body);

    try {
        const userChats = await UserChats.find({ userId });
        res.status(200).send(userChats[0].chats);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching userchats!");
    }
};

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get a specific chat by ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Error fetching chat
 */
exports.userChatWithID = async (req, res) => {
    // const userId = 1234567;
    const userId = req.auth.userId;

    console.log(req.body);

    try {
        const chat = await Chat.findOne({ _id: req.params.id, userId });

        res.status(200).send(chat);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching chat!");
    }
};

/**
 * @swagger
 * /api/chats/{id}:
 *   put:
 *     summary: Update a chat with new messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               img:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Error adding conversation
 */
exports.updateChatWithId = async (req, res) => {
    // const userId = 1234567;
    const userId = req.auth.userId;
    console.log(req.body);

    const { question, answer, img } = req.body;
    console.log(req.body);

    const newItems = [
        ...(question ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }] : []),
        { role: "model", parts: [{ text: answer }] },
    ];

    try {
        const updatedChat = await Chat.updateOne(
            { _id: req.params.id, userId },
            {
                $push: {
                    history: {
                        $each: newItems,
                    },
                },
            }
        );
        res.status(200).send(updatedChat);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding conversation!");
    }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         history:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               parts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *               img:
 *                 type: string
 */
