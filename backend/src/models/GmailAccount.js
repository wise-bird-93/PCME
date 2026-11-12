
const mongoose = require("mongoose");

const gmailAccountSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        encryptedRefreshToken: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("GmailAccount", gmailAccountSchema);
