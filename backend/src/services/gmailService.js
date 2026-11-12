
const { google } = require("googleapis");
const GmailAccount = require("../models/GmailAccount");
const { decrypt } = require("../utils/tokenEncryption");

async function fetchRecentEmails(email, limit = 20) {
    const account = await GmailAccount.findOne({
        email: email.toLowerCase()
    });

    if (!account) {
        throw new Error("Gmail account not connected");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        refresh_token: decrypt(account.encryptedRefreshToken)
    });

    const gmail = google.gmail({
        version: "v1",
        auth: oauth2Client
    });

    const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: limit
    });

    const messages = response.data.messages || [];

    const emails = await Promise.all(
        messages.map(async (message) => {
            const result = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "metadata",
                metadataHeaders: ["From", "To", "Subject", "Date"]
            });

            const headers = result.data.payload.headers || [];

            const getHeader = (name) =>
                headers.find(
                    header => header.name.toLowerCase() === name.toLowerCase()
                )?.value || "";

            return {
                id: result.data.id,
                threadId: result.data.threadId,
                sender: getHeader("From"),
                receiver: getHeader("To"),
                subject: getHeader("Subject"),
                date: getHeader("Date"),
                timestamp: result.data.internalDate
            };
        })
    );

    return emails;
}

module.exports = { fetchRecentEmails };
