const express = require("express");
const generateTextOpenAI = require("../../controllers/openAI/generateOpenAIController");

const router = express.Router();

router.post("/v1/chat/generateText", generateTextOpenAI.generateTextOpenAI);

module.exports = router;
