
const UsageSession = require("../models/UsageSession");

const getUsageAnalytics = async (req, res) => {
    try {
        const {
            email,
            date,
            startDate,
            endDate,
            timezoneOffset = 0
        } = req.query;

        if (!email || (!date && (!startDate || !endDate))) {
            return res.status(400).json({
                success: false,
                message: "Email and date range are required"
            });
        }

        const isValidDate = (value) =>
            /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()) &&
            new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

        const fromDate = startDate || date;
        const toDate = endDate || date;

        if (!isValidDate(fromDate) || !isValidDate(toDate)) {
            return res.status(400).json({
                success: false,
                message: "Dates must be valid YYYY-MM-DD values"
            });
        }

        if (fromDate > toDate) {
            return res.status(400).json({
                success: false,
                message: "startDate cannot be after endDate"
            });
        }

        const offset = Number(timezoneOffset);

        if (!Number.isFinite(offset) || Math.abs(offset) > 840) {
            return res.status(400).json({
                success: false,
                message: "Invalid timezone offset"
            });
        }

        const startTime = new Date(`${fromDate}T00:00:00.000Z`);
        startTime.setMinutes(startTime.getMinutes() + offset);

        const endTime = new Date(`${toDate}T00:00:00.000Z`);
        endTime.setUTCDate(endTime.getUTCDate() + 1);
        endTime.setMinutes(endTime.getMinutes() + offset);

        const sessions = await UsageSession.aggregate([
            {
                $match: {
                    email: email.toLowerCase(),
                    startTime: {
                        $gte: startTime,
                        $lt: endTime
                    }
                }
            },
            {
                $group: {
                    _id: {
                        platform: "$platform",
                        source: "$source"
                    },
                    totalSeconds: {
                        $sum: "$durationSeconds"
                    },
                    sessionCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const applications = [];
        const websites = [];

        let totalActiveSeconds = 0;

        for (const session of sessions) {
            const item = {
                platform: session._id.platform,
                totalSeconds: session.totalSeconds,
                sessionCount: session.sessionCount
            };

            if (session._id.source === "desktop") {
                applications.push(item);
                totalActiveSeconds += session.totalSeconds;
            } else if (session._id.source === "browser") {
                websites.push(item);
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                date: date || null,
                startDate: fromDate,
                endDate: toDate,
                totalActiveSeconds,
                applications,
                websites
            }
        });

    } catch (error) {
        console.error("Usage analytics error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch usage analytics"
        });
    }
};

module.exports = { getUsageAnalytics };
