
const UsageSession = require("../models/UsageSession");

const saveUsageSessions = async (req, res) => {
    try {
        const { email, sessions } = req.body;

        if (!email || !Array.isArray(sessions) || sessions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Email and sessions are required"
            });
        }

        const records = sessions.map((session) => ({
            email,
            platform: session.domain || session.appName,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
            durationSeconds: session.durationSeconds,
            source: session.source || "browser"
        }));

        const savedSessions = await UsageSession.insertMany(records);

        return res.status(201).json({
            success: true,
            message: "Usage sessions saved successfully",
            count: savedSessions.length
        });

    } catch (error) {
        console.error("Usage ingestion error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save usage sessions"
        });
    }
};

module.exports = { saveUsageSessions };
