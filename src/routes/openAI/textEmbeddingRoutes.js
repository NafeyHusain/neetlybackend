const express = require("express");
const generateEmbeddedController = require("../../controllers/openAI/textEmbeddingController");

const router = express.Router();
router.post("/v1/chat/generateFromEmbeddedtext", generateEmbeddedController.generateEmbeddedText);
router.post("/v1/chat/insertMessage", generateEmbeddedController.storeEmbeddingText);

module.exports = router;
