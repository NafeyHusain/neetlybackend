const axios = require("axios");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { generateMultipleChoice, generateTextMessage } = require("../lib/gemini");
const { generateTextMessageOpenAI } = require("../lib/openAI");

const KRUTRIM_API_KEY = process.env.KRUTRIM_API_KEY;
const KRUTRIM_API_URL = "https://cloud.olakrutrim.com/v1/chat/completions";

async function generateMCQs(topic, numberOfQuestions = 10) {
    const prompt = `Generate really hard ${numberOfQuestions} multiple choice questions about ${topic}. For each question, provide 4 options and indicate the correct answer ,include explaination for each question answer keep in mind explanaination should be like professional doctor. Format the output as a JSON array of objects, where each object has the properties: question as text label,subject field where topic lies in, options (an array of 4 strings), and correctAnswer (index of the correct option, 0-based),explaination on the answer. should not contain other than jsonarray and correct answer should consist only index, and exclude which are already generated `;

    // const data = {
    //     model: "Meta-Llama-3-8B-Instruct",
    //     messages: [
    //         { role: "system", content: "You are a helpful doctor professional who is specalised in mbbs ,md other degree and you are generating questions for pg neet preparation" },
    //         { role: "user", content: prompt },
    //     ],
    //     frequency_penalty: 0,
    //     logit_bias: { 2435: -100, 640: -100 },
    //     logprobs: true,
    //     top_logprobs: 2,
    //     max_tokens: 1000, // Increased to accommodate multiple questions
    //     n: 1,
    //     presence_penalty: 0,
    //     response_format: { type: "text" },
    //     stop: null,
    //     stream: false,
    //     temperature: 0.7, // Slight randomness for variety
    //     top_p: 1,
    // };

    // try {
    //     const response = await axios.post(KRUTRIM_API_URL, data, {
    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${KRUTRIM_API_KEY}`,
    //         },
    //     });
    try {
        const result = await generateTextMessage(prompt);
        console.log(result);
        // const content = result.response.data.choices[0].message.content;
        // console.log(content);
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const mcqs = JSON.parse(jsonMatch[0]);
                const mcqsWithUuid = mcqs.map((question) => {
                    const correctAnswerText = question.options[question.correctAnswer];
                    return {
                        id: uuidv4(),
                        subject: question.subject == null ? "not define" : question.subject,
                        text: question.question,
                        type: "single",
                        options: question.options,
                        correct: [correctAnswerText],
                        explanation: question.explanation,
                    };
                });
                return mcqsWithUuid;
            } catch (parseError) {
                console.error("Error parsing extracted JSON:", parseError);
                throw new Error("Failed to parse MCQ data from API response");
            }
        } else {
            console.error("No JSON array found in the content");
            throw new Error("Invalid response format from API");
        }
    } catch (error) {
        console.error("Error generating MCQs:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { generateMCQs };
