const model = require("../lib/gemini.js");
const axios = require("axios");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { generateTextMessage } = require("../lib/gemini");

// async function generateTextMessage(topic) {
//     try {
//         const prompt = `Write a story about an ${topic}`;

//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();
//         console.log(text);

//         const content = response.data.choices[0].message.content;
//         console.log(content);
//         const jsonMatch = content.match(/\[[\s\S]*\]/);
//         if (jsonMatch) {
//             try {
//                 const mcqs = JSON.parse(jsonMatch[0]);
//                 return mcqs;
//             } catch (parseError) {
//                 console.error("Error parsing extracted JSON:", parseError);
//                 throw new Error("Failed to parse MCQ data from API response");
//             }
//         } else {
//             console.error("No JSON array found in the content");
//             throw new Error("Invalid response format from API");
//         }
//     } catch (error) {
//         console.error("Error generating MCQs:", error.response?.data || error.message);
//         throw error;
//     }
// }

async function generateMCQs(topic, numberOfQuestions = 10) {
    const prompt = `Generate really hard ${numberOfQuestions} multiple choice questions about ${topic}. For each question, provide 4 options and indicate the correct answer ,include explaination for each question answer keep in mind explanaination should be like professional doctor. Format the output as a JSON array of objects, where each object has the properties: question as text label,subject field where topic lies in, options (an array of 4 strings), and correctAnswer (index of the correct option, 0-based),explaination on the answer. should not contain other than jsonarray and correct answer should consist only index, and exclude which are already generated `;
    try {
        const result = await generateTextMessage(prompt);
        console.log(result);
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
