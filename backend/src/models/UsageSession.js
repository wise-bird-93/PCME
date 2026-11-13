const mongoose = require("mongoose");

const usageSessionSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            index: true
        },
        platform: {
            type: String,
            required: true,
            lowercase: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        durationSeconds: {
            type: Number,
            required: true,
            min: 0
        },
        source: {
            type: String,
            enum: ["browser", "desktop"],
            default: "browser"
        }
    },
    { timestamps: true }
);

usageSessionSchema.index({ email: 1, startTime: -1 });

module.exports = mongoose.model(
    "UsageSession",
    usageSessionSchema
);
