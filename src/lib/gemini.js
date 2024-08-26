const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
];

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOLE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, safetySettings);
async function generateTextMessage(topic) {
    try {
        const prompt = `${topic}`;

        const result = await model.generateContent(prompt);
        // Assuming a method like generateText exists on the model object
        //   const response = await model.generateContent({
        //       prompt,
        //   });
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text;
        if (jsonMatch) {
            try {
                return jsonMatch;
            } catch {
                console.error("Error parsing extracted JSON:");
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
