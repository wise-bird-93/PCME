
const mongoose = require("mongoose");

const activityEventSchema = new mongoose.Schema(
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
        eventType: {
            type: String,
            required: true
        },
        sourceMessageId: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            required: true,
            index: true
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 1
        }
    },
    { timestamps: true }
);

activityEventSchema.index(
    { email: 1, sourceMessageId: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "ActivityEvent",
    activityEventSchema
);
