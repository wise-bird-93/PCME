
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
            source: session.source || "browser",
            activityType: session.activityType || "active",
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

const getUsageTimeline = async (req, res) => {
    try {
        const { email, date, timezoneOffset = 0 } = req.query;

        if (!email || !date) {
            return res.status(400).json({
                success: false,
                message: "Email and date are required"
            });
        }

        const offset = Number(timezoneOffset);

        const [year, month, day] = date.split("-").map(Number);

        const start = new Date(Date.UTC(year, month - 1, day));
        start.setUTCMinutes(start.getUTCMinutes() + offset);

        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);

        const sessions = await UsageSession.find({
            email,
            startTime: { $gte: start, $lt: end }
        })
            .sort({ startTime: 1 })
            .select("platform source activityType startTime endTime durationSeconds -_id");

        return res.status(200).json({
            success: true,
            data: sessions
        });

    } catch (error) {
        console.error("Usage timeline error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch usage timeline"
        });
    }
};

module.exports = {
    saveUsageSessions,
    getUsageTimeline
};
