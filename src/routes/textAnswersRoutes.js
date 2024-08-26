const express = require("express");
const generateText = require("../controllers/textAnswerController");

const router = express.Router();

router.post("/generateText", generateText.generateText);

module.exports = router;
