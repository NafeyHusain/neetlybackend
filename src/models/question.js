const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    history: [
        {
            topic: {
                type: String,
                required: true,
            },
            totalQuestions: {
                type: Number,
                required: true,
            },
            marks: {
                type: Number,
                required: true,
                min: 0,
            },
            questionData: [
                {
                    text: {
                        type: String,
                        required: true,
                    },
                    type: {
                        type: String,
                        enum: ["single", "multiple"],
                        required: true,
                    },
                    options: {
                        type: [String],
                        required: true,
                    },
                    correct: {
                        type: [String],
                        required: true,
                    },
                    explanation: {
                        type: String,
                        required: true,
                    },
                    subject: {
                        type: String,
                        default: "not defined",
                    },

                    userAnswer: {
                        type: [Number],
                        default: [],
                    },
                },
            ],
        },
    ],
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
