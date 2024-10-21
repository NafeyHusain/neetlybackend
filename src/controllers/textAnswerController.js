const { generateTextMessages } = require("../lib/gemini");

// exports.generateText = async (req, res) => {
//     try {
//         let prompt = [];
//         if (req.body.payload.data.length === 1) {
//             let text = req.body.payload.data[0];
//             prompt = [
//                 "Consider yourself expert in medical science and you are trying to explain it to a scientist and answer the question " +
//                     text,
//             ];
//         } else {
//             let text = req.body.payload.data[1];
//             text =
//                 "Consider yourself expert in medical science and you are trying to explain it to a scientist and answer the question,i have provided the base64 image content" +
//                 text;   
//             prompt = [req.body.payload.data[0], text];
//         }

//         if (!prompt) {
//             return res.status(400).json({ error: "Topic is required" });
//         }

//         const mcqs = await generateTextMessage(prompt);
//         res.json(mcqs);
//     } catch (error) {
//         console.error("Error in generateMCQ:", error);
//         res.status(500).json({ error: "An error occurred while generating MCQs" });
//     }
// };

exports.generateText = async (req, res) => {
    try {
        const payloadData = req.body.payload.data;

        if (!payloadData || !Array.isArray(payloadData) || payloadData.length === 0) {
            return res.status(400).json({ error: "Payload data is required and should be a non-empty array." });
        }

        let textPrompt = "";
        let imageBase64 = null;
        let mimeType="";

        if (payloadData.length === 1) {
            // Only text is provided
            textPrompt = "Consider yourself an expert in medical science and you are trying to explain it to a mbbs student and answer the question: " + payloadData[0];
        } else if (payloadData.length === 2) {
            // Both text and image are provided
            mimeType = getMimeType(payloadData[0])
            textPrompt = "Consider yourself an expert in medical science and you are trying to explain it to a mbbs student and answer the question: " + payloadData[1];
            imageBase64 = cleanBase64Prefix(payloadData[0]);

            // Optional: Validate the Base64 string
        } else {
            return res.status(400).json({ error: "Payload data should contain either 1 or 2 items (text and optional image)." });
        }

        const mcqs = await generateTextMessages(textPrompt, imageBase64,mimeType);
        res.json(mcqs);
    } catch (error) {
        console.error("Error in generateMCQ:", error);
        res.status(500).json({ error: "An error occurred while generating MCQs" });
    }
};

// Helper function to validate Base64 strings
function isValidBase64(str) {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    } catch (err) {
        return false;
    }
}

function getMimeType(dataURI) {
    // Ensure the input is a string
    if (typeof dataURI !== 'string') {
        console.error('Invalid input: dataURI must be a string.');
        return null;
    }

    // Regular expression to match the MIME type in a Data URI
    const regex = /^data:([^;]+)(;base64)?,/;

    const matches = dataURI.match(regex);

    if (matches && matches[1]) {
        return matches[1];
    } else {
        console.warn('MIME type not found in the provided Data URI.');
        return null;
    }
}

function cleanBase64Prefix(base64String) {
    if (typeof base64String !== 'string') {
        throw new Error('Invalid input type: Base64 data must be a string.');
    }

    // Regular expression to match Data URI schemes for images
    const dataUriPattern = /^data:image\/[a-zA-Z]+;base64,/;

    // Check if the string starts with a Data URI scheme
    if (dataUriPattern.test(base64String)) {
        // Remove the Data URI prefix
        
        base64String = base64String.replace(dataUriPattern, '');
    }

    // Optional: Trim whitespace
    base64String = base64String.trim();

    // Validate the cleaned Base64 string
    if (!isValidBase64(base64String)) {
        throw new Error('Invalid Base64 string after cleaning prefix.');
    }

    return base64String;
}


