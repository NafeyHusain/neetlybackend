const express = require("express");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const {
    mcqHistory,
    userMcqHistory,
    mcqHistoryWithId,
    updateMcqHistoryWithId,
    subjectWiseMcq,
} = require("../controllers/mcqHistoryController");
const router = express.Router();

router.post("/mcq/mcqHistory",ClerkExpressRequireAuth(), mcqHistory);
router.get("/mcq/questHistory/:id",ClerkExpressRequireAuth(), mcqHistoryWithId);
router.get("/mcq/userMcqHistory",ClerkExpressRequireAuth(), userMcqHistory);
router.put("/mcq/questHistory/:id",ClerkExpressRequireAuth(), updateMcqHistoryWithId);
router.get("/mcq/mcq-sets/meta",ClerkExpressRequireAuth(),subjectWiseMcq)

// router.get("/chats/:id", ClerkExpressRequireAuth(), userChatWithID);
// router.put("/chats/:id", ClerkExpressRequireAuth(), updateChatWithId);
module.exports = router;
