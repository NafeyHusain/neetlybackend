const express = require("express");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const {
    mcqHistory,
    userMcqHistory,
    mcqHistoryWithId,
    updateMcqHistoryWithId,
} = require("../controllers/mcqHistoryController");
const router = express.Router();

router.post("/mcq/mcqHistory", mcqHistory);
router.get("/mcq/questHistory/:id", mcqHistoryWithId);
router.get("/mcq/userMcqHistory", userMcqHistory);
router.put("/mcq/questHistory/:id", updateMcqHistoryWithId);

// router.get("/chats/:id", ClerkExpressRequireAuth(), userChatWithID);
// router.put("/chats/:id", ClerkExpressRequireAuth(), updateChatWithId);
module.exports = router;
