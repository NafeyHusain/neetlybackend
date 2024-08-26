const model = require("../lib/gemini.js");

async function generateTextMessage(topic) {
    try {
        const prompt = `Write a story about an ${topic}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);

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

module.exports = { generateTextMessage };
