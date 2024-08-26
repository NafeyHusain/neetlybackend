const express = require("express");

const router = express.Router();
const { signup, signin } = require("../controllers/userController");
const { requireSignin } = require("../middleware/auth");

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Get a list of users
 *     description: Retrieve a list of users from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 */
router.post("/signup", signup);
router.post("/signin", signin);

router.post("/profile", requireSignin, (req, res) => {
    res.status(200).json({ success: true });
});

module.exports = router;
