const express = require("express");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

// Rest of your code
const { chatsHistory, userChats, userChatWithID, updateChatWithId } = require("../controllers/chatHistoryController");

const router = express.Router();

// router.post("/chats", ClerkExpressRequireAuth(), chatsHistory);
// router.get("/userchats", ClerkExpressRequireAuth(), userChats);
// router.get("/chats/:id", ClerkExpressRequireAuth(), userChatWithID);
// router.put("/chats/:id", ClerkExpressRequireAuth(), updateChatWithId);


router.post("/chats",  chatsHistory);
router.get("/userchats",  userChats);
router.get("/chats/:id",  userChatWithID);
router.put("/chats/:id", updateChatWithId);

module.exports = router;
