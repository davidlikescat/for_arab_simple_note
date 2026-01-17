const { processMeetingNotes } = require('../lib/openai');
const { createMeetingPage } = require('../lib/notion');

module.exports = async (req, res) => {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is missing via process.env");
        }
        if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
            throw new Error("NOTION_API_KEY or NOTION_DATABASE_ID is missing via process.env");
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text content is required' });
        }

        // Step 1: Process with OpenAI
        console.log("Processing with OpenAI gpt-4o-mini...");
        const meetingData = await processMeetingNotes(text);
        console.log("OpenAI output:", meetingData);

        // Step 2: Save to Notion
        console.log("Saving to Notion...");
        const notionResponse = await createMeetingPage(meetingData);

        return res.status(200).json({
            success: true,
            message: 'Successfully processed and saved to Notion',
            data: meetingData,
            notionUrl: notionResponse.url
        });

    } catch (error) {
        console.error('====================================');
        console.error('[[ API ERROR LOG ]]');
        console.error('Time:', new Date().toISOString());
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);

        // Determine error source
        let errorSource = 'UNKNOWN';
        if (error.message.includes('OPENAI')) errorSource = 'OPENAI_CONFIG';
        if (error.message.includes('NOTION')) errorSource = 'NOTION_CONFIG';
        if (error.stack && error.stack.includes('openai')) errorSource = 'OPENAI_API';
        if (error.stack && error.stack.includes('notion')) errorSource = 'NOTION_API';

        console.error('Source:', errorSource);
        console.error('====================================');

        return res.status(500).json({
            error: 'Internal Server Error',
            code: errorSource,
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
