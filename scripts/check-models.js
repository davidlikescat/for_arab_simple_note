require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // For some SDK versions, it's genAI.getGenerativeModel... but looking for listModels or similar on the client? 
        // actually SDK might not expose listModels directly on the main class easily in all versions, 
        // but let's try via the model manager if available or just try a standard request.

        // Actually the SDK documentation says:
        // const genAI = new GoogleGenerativeAI(API_KEY);
        // The SDK doesn't always have a direct listModels helper in the node setup easily without using the lower level API.
        // Let's try to infer availability by trying a simple prompt on likely candidates.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        console.log("Checking model availability...");

        for (const modelName of candidates) {
            try {
                process.stdout.write(`Testing ${modelName}... `);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                const response = await result.response;
                console.log(`✅ OK (${response.text().trim()})`);
            } catch (error) {
                console.log(`❌ Failed: ${error.message.split(' ')[0]}...`); // Just first part of error
            }
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

listModels();
