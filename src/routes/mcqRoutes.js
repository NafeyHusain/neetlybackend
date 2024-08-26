const express = require("express");
const mcqController = require("../controllers/mcqController");
const { requireSignin } = require("../middleware/auth");

const router = express.Router();

router.post("/generate", mcqController.generateMCQ);

module.exports = router;
