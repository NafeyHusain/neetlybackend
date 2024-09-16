// Import OpenAI SDK
const OpenAIApi = require("openai"); // Import OpenAI

// Initialize OpenAI API with your key
const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored as an environment variable
});
// Chat model using GPT-4
const chatModel = async (history) => {
    return openai.chat.completions.create({
        model: "gpt-4", // You can change this to gpt-3.5-turbo if required
        messages: history,
        max_tokens: 2000, // Configurable
        temperature: 0.5, // Adjust as needed
    });
};

const initialChatHistory = [
    {
        role: "system",
        content:
            "You are an experienced medical expert in medical science, a professional, well-trained doctor capable of generating expert-level content on medical case studies and detailed explanations for scientists.",
    },
    {
        role: "assistant",
        content:
            "You are capable of generating expert-level content on medical case studies and detailed explanations for a scientist.",
    },
];

async function generateTextMessageOpenAI(topic) {
    try {
        console.log(topic[0]);
        // Add the new user prompt to the history
        const userMessage = { role: "user", content: topic[0] };
        const history = [...initialChatHistory, userMessage];
        const response = await chatModel(history);
        console.log(response);
        const responseText = response.choices[0].message.content;
        return responseText;
    } catch (error) {
        console.error("Error generating response:", error.response?.data || error.message);
        throw error;
    }
}

// Function to generate multiple choice questions (MCQs)
async function generateMultipleChoiceOpenAI(topic) {
    try {
        // Add the new user prompt for MCQ generation to the history
        const userMessage = {
            role: "user",
            content: `Assume experienced medical expert Generate tough and detailed multiple-choice questions on the topic: ${topic}`,
        };
        const history = [...initialChatHistory, userMessage];

        // Call OpenAI API to generate MCQs
        const response = await chatModel(history);

        // Extract the response text (MCQs) from OpenAI
        const responseText = response.data.choices[0].message.content;
        return responseText;
    } catch (error) {
        console.error("Error generating MCQs:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { generateTextMessageOpenAI, generateMultipleChoiceOpenAI };
