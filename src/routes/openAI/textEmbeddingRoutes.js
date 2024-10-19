const express = require("express");
const generateEmbeddedController = require("../../controllers/openAI/textEmbeddingController");
const documentEmbeddingController = require("../../controllers/openAI/documentEmbeddingController");

const router = express.Router();
router.post("/v1/chat/generateFromEmbeddedtext", generateEmbeddedController.generateEmbeddedText);
router.post("/v1/chat/insertMessage", generateEmbeddedController.storeEmbeddingText);

router.post("/vi/pdf/insertDocument", documentEmbeddingController.generateDocumentEmbeddedText);
module.exports = router;
