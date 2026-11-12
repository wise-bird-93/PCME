
const express = require("express");
const crypto = require("crypto");
const { google } = require("googleapis");

const router = express.Router();
const oauth2Client = require("../config/googleAuth");
const GmailAccount = require("../models/GmailAccount");
const { encrypt } = require("../utils/tokenEncryption");
const { fetchRecentEmails } = require("../services/gmailService");

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.metadata"
];

router.get("/auth/google", (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");

    res.cookie("pcme_oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 10 * 60 * 1000,
        path: "/"
    });

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
        state
    });

    res.redirect(authUrl);
});

router.get("/auth/google/callback", async (req, res) => {
    try {
        const cookies = req.headers.cookie || "";
        const stateCookie = cookies
            .split(";")
            .map(cookie => cookie.trim())
            .find(cookie => cookie.startsWith("pcme_oauth_state="));

        const savedState = stateCookie
            ? decodeURIComponent(stateCookie.split("=").slice(1).join("="))
            : "";

        const receivedState = req.query.state || "";

        res.clearCookie("pcme_oauth_state", { path: "/" });

        if (
            !savedState ||
            !receivedState ||
            savedState.length !== receivedState.length ||
            !crypto.timingSafeEqual(
                Buffer.from(savedState),
                Buffer.from(receivedState)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid OAuth state"
            });
        }

        if (req.query.error) {
            return res.status(400).json({
                success: false,
                message: "Google authorization was denied"
            });
        }

        if (!req.query.code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code missing"
            });
        }

        const { tokens } = await oauth2Client.getToken(req.query.code);
        oauth2Client.setCredentials(tokens);

        if (!tokens.refresh_token) {
            return res.status(400).json({
                success: false,
                message: "Refresh token missing. Please authorize again."
            });
        }

        const gmail = google.gmail({
            version: "v1",
            auth: oauth2Client
        });

        const profile = await gmail.users.getProfile({
            userId: "me"
        });

        const email = profile.data.emailAddress;

        await GmailAccount.findOneAndUpdate(
            { email },
            {
                email,
                encryptedRefreshToken: encrypt(tokens.refresh_token)
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Gmail connected successfully",
            email
        });

    } catch (error) {
        console.error("Google OAuth error:", error.message);

        res.status(500).json({
            success: false,
            message: "Gmail connection failed"
        });
    }
});

router.get("/gmail/emails", async (req, res) => {
    try {
        const account = await GmailAccount.findOne();

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "No Gmail account connected"
            });
        }

        const emails = await fetchRecentEmails(account.email, 10);

        res.json({
            success: true,
            count: emails.length,
            data: emails
        });

    } catch (error) {
        console.error("Gmail fetch error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch Gmail metadata"
        });
    }
});

module.exports = router;
