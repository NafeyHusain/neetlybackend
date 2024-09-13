const mongoose = require("mongoose");
const UserQuestionsSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        questions: [
            {
                _id: {
                    type: String,
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
    },
    { timestamps: true }
);

const UserQuestions = mongoose.model("UserQuestions", UserQuestionsSchema);

module.exports = UserQuestions;
