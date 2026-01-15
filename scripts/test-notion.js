require('dotenv').config();
const { createMeetingPage } = require('../lib/notion');

async function testConnection() {
    console.log("Testing Notion Integration...");
    console.log("Database ID:", process.env.NOTION_DATABASE_ID);

    // Minimal dummy data
    const dummyData = {
        title: "Integration Test (You can delete this)",
        executive_summary: "If you see this, the Notion connectivity is working perfectly.",
        date: new Date().toISOString().split('T')[0],
        tags: ["Test", "API"],
        participants: ["Bot"]
    };

    try {
        const response = await createMeetingPage(dummyData);
        console.log("✅ Success! Created page:", response.url);
    } catch (error) {
        console.error("❌ Failed:", error.message);
        if (error.code === 'object_not_found') {
            console.error("Hint: The integration might not be invited to the specific database yet.");
        }
    }
}

testConnection();
