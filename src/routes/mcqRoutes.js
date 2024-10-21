const express = require("express");
const mcqController = require("../controllers/mcqController");
const { requireSignin } = require("../middleware/auth");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const router = express.Router();

router.post("/generate", mcqController.generateMCQ);
router.get("/getAIsuggestion/:id",ClerkExpressRequireAuth(), mcqController.createAISuggestion);

module.exports = router;
