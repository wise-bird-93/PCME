import { PCME_EMAIL } from "./config.mjs";

import activeWindow from "active-win";
import { spawn } from "child_process";
import { createInterface } from "readline";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const idleScript = path.join(currentDir, "idle-check.ps1");
const sessionsFile = path.join(currentDir, "pendingSessions.json");


const API_URL = "http://localhost:5000/usage/sessions";

let currentSession = null;
let idleSeconds = 0;
let isUploading = false;
let isTracking = false;

const idleProcess = spawn(
    "powershell.exe",
    [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        idleScript
    ],
    { windowsHide: true }
);

const idleReader = createInterface({
    input: idleProcess.stdout
});

idleReader.on("line", line => {
    const value = Number(line.trim());

    if (Number.isFinite(value)) {
        idleSeconds = value;
    }
});

idleProcess.stderr.on("data", data => {
    console.error("Idle detection error:", data.toString());
});

async function getPendingSessions() {
    try {
        const data = await fs.readFile(sessionsFile, "utf8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function uploadPendingSessions() {
    if (isUploading) return;

    if (!PCME_EMAIL || PCME_EMAIL.includes("YOUR_CONNECTED")) {
        console.error("Configure PCME_EMAIL first.");
        return;
    }

    isUploading = true;

    try {
        const sessions = await getPendingSessions();

        if (sessions.length === 0) return;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: PCME_EMAIL,
                sessions: sessions.map(session => ({
                    ...session,
                    source: "desktop"
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const uploadedIds = new Set(
            sessions.map(session => session.localId)
        );

        const latestSessions = await getPendingSessions();

        const remainingSessions = latestSessions.filter(
            session => !uploadedIds.has(session.localId)
        );

        await fs.writeFile(
            sessionsFile,
            JSON.stringify(remainingSessions, null, 2)
        );

        console.log("Desktop sessions uploaded:", sessions.length);

    } catch (error) {
        console.error("Upload failed. Sessions retained:", error);
    } finally {
        isUploading = false;
    }
}


async function endCurrentSession(endTime = Date.now()) {
    if (!currentSession) return;

    const sessionToEnd = currentSession;
    currentSession = null;

    const durationSeconds = Math.floor(
        (endTime - sessionToEnd.startTime) / 1000
    );

    if (durationSeconds < 1) return;

    try {
        const sessions = await getPendingSessions();

        sessions.push({
            localId: crypto.randomUUID(),
            appName: sessionToEnd.appName,
            startTime: sessionToEnd.startTime,
            endTime,
            durationSeconds
        });

        await fs.writeFile(
            sessionsFile,
            JSON.stringify(sessions, null, 2)
        );

        console.log("Session completed:", {
            appName: sessionToEnd.appName,
            durationSeconds
        });

        await uploadPendingSessions();

    } catch (error) {
        console.error("Session save error:", error);
    }
}


async function trackActiveApplication() {
    if (isTracking) return;

    isTracking = true;

    try {
        if (idleSeconds >= 60) {
            if (currentSession) {
                await endCurrentSession(
                    Date.now() - idleSeconds * 1000
                );
            }
            return;
        }

        const window = await activeWindow();
        const currentApp = window?.owner?.name || null;

        if (currentApp !== currentSession?.appName) {
            console.log("Foreground application detected:", {
                appName: window?.owner?.name,
                appPath: window?.owner?.path,
                processId: window?.owner?.processId
            });
        }

        if (!currentApp || currentApp === "LockApp.exe") {
            if (currentSession) {
                await endCurrentSession();
            }
            return;
        }

        if (currentSession?.appName === currentApp) {
            return;
        }

        if (currentSession) {
            await endCurrentSession();
        }

        currentSession = {
            appName: currentApp,
            startTime: Date.now()
        };

        console.log("Tracking started:", currentApp);

    } catch (error) {
        console.error("Detection error:", error);
    } finally {
        isTracking = false;
    }
}

setInterval(trackActiveApplication, 1000);

// Retry pending uploads every 30 seconds.
setInterval(uploadPendingSessions, 30000);

trackActiveApplication();
uploadPendingSessions();

process.on("exit", () => {
    idleProcess.kill();
});


