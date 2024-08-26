const express = require("express");
const { chatsHistory, userChats, userChatWithID } = require("../controllers/chatHistoryController");

const router = express.Router();

router.post("/addChats", chatsHistory);
router.get("/userchats", userChats);
router.get("/chats/:id", userChatWithID);

module.exports = router;
