const axios = require("axios");
require("dotenv").config();

const KRUTRIM_API_KEY = process.env.KRUTRIM_API_KEY;
const KRUTRIM_API_URL = "https://cloud.olakrutrim.com/v1/chat/completions";

// async function generateMCQs(topic, numberOfQuestions = 10) {
//     const prompt = `Generate ${numberOfQuestions} multiple-choice questions about ${topic}. For each question, provide 4 options and indicate the correct answer. Format the output as a JSON array of objects, where each object has the properties: question, options (an array of 4 strings), and correctAnswer (index of the correct option, 0-based). shuould not contain other than jsonarray and correct answer should consist only index, and exclude which are already generated for nafey`;
//     const url = "https://api.openai.com/v1/completions"; // OpenAI API endpoint for completions
//     const apiKey = KRUTRIM_API_KEY; // Replace with your OpenAI API key

//     const data = {
//         model: "gpt-4o-mini", // Specify the GPT-4 model
//         messages: [
//             {
//                 role: "system",
//                 content: "You are a helpful assistant.",
//             },
//             {
//                 role: "user",
//                 content: prompt, // User's prompt
//             },
//         ],
//         max_tokens: 100, // Adjust this value according to your needs
//         temperature: 0.7,
//     };

//     try {
//         const response = await fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${apiKey}`,
//             },
//             body: JSON.stringify(data),
//         });

//         if (!response.ok) {
//             throw new Error(`Error: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log(result.choices[0].text.trim()); // Log the response from the API
//     } catch (error) {
//         console.error("Error calling OpenAI API:", error);
//     }
// }

async function generateMCQs(topic, numberOfQuestions = 10) {
    const prompt = `Generate ${numberOfQuestions} multiple-choice questions about ${topic}. For each question, provide 4 options and indicate the correct answer. Format the output as a JSON array of objects, where each object has the properties: question, options (an array of 4 strings), and correctAnswer (index of the correct option, 0-based). should not contain other than jsonarray and correct answer should consist only index, and exclude which are already generated `;

    const data = {
        model: "Meta-Llama-3-8B-Instruct",
        messages: [
            { role: "system", content: "You are a helpful assistant specialized in generating MCQs." },
            { role: "user", content: prompt },
        ],
        frequency_penalty: 0,
        logit_bias: { 2435: -100, 640: -100 },
        logprobs: true,
        top_logprobs: 2,
        max_tokens: 1000, // Increased to accommodate multiple questions
        n: 1,
        presence_penalty: 0,
        response_format: { type: "text" },
        stop: null,
        stream: false,
        temperature: 0.7, // Slight randomness for variety
        top_p: 1,
    };

    try {
        const response = await axios.post(KRUTRIM_API_URL, data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${KRUTRIM_API_KEY}`,
            },
        });

        const content = response.data.choices[0].message.content;
        console.log(content);
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const mcqs = JSON.parse(jsonMatch[0]);
                return mcqs;
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
