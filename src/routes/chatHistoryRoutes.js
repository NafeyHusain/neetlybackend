const express = require("express");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const { Clerk } = require("@clerk/clerk-sdk-node");

// Initialize Clerk
const clerk = new Clerk({ apiKey: process.env.CLERK_PUBLISHABLE_KEY });

// Middleware to protect routes
const requireAuth = clerk.middleware();

// Rest of your code
const { chatsHistory, userChats, userChatWithID, updateChatWithId } = require("../controllers/chatHistoryController");

const router = express.Router();

router.post("/chats", requireAuth, chatsHistory);
router.get("/userchats", requireAuth, userChats);
router.get("/chats/:id", requireAuth, userChatWithID);
router.put("/chats/:id", requireAuth, updateChatWithId);

// router.post("/chats", ClerkExpressRequireAuth(), chatsHistory);
// router.get("/userchats", ClerkExpressRequireAuth(), userChats);
// router.get("/chats/:id", ClerkExpressRequireAuth(), userChatWithID);
// router.put("/chats/:id", ClerkExpressRequireAuth(), updateChatWithId);

// router.post("/chats", chatsHistory);
// router.get("/userchats", userChats);
// router.get("/chats/:id", userChatWithID);
// router.put("/chats/:id", updateChatWithId);

module.exports = router;
