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


const API_URL = "https://pcme.onrender.com/usage/sessions";

let currentSession = null;
let idleSeconds = 0;
let idleSession = null;
let lastActivityState = "active";
let sleepSession = null;
let lastSleepEventTime = 0;
let lockedSession = null;
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
    const value = line.trim();

    if (value.startsWith("SLEEP_START|")) {
        const timestamp = Number(value.split("|")[1]);
        if (Number.isFinite(timestamp)) {
            handleSleepStart(timestamp).catch(console.error);
        }
        return;
    }

    if (value.startsWith("SLEEP_END|")) {
        const timestamp = Number(value.split("|")[1]);
        if (Number.isFinite(timestamp)) {
            handleSleepEnd(timestamp).catch(console.error);
        }
        return;
    }

    const seconds = Number(value);

    if (Number.isFinite(seconds)) {
        idleSeconds = seconds;
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

async function endIdleSession(endTime = Date.now()) {
    if (!idleSession) return;

    const sessionToEnd = idleSession;
    idleSession = null;

    const durationSeconds = Math.floor(
        (endTime - sessionToEnd.startTime) / 1000
    );

    if (durationSeconds < 1) return;

    try {
        const sessions = await getPendingSessions();

        sessions.push({
            localId: crypto.randomUUID(),
            appName: "Idle",
            activityType: "idle",
            startTime: sessionToEnd.startTime,
            endTime,
            durationSeconds
        });

        await fs.writeFile(
            sessionsFile,
            JSON.stringify(sessions, null, 2)
        );

        console.log("Idle session completed:", durationSeconds);

        await uploadPendingSessions();

    } catch (error) {
        console.error("Idle session save error:", error);
    }
}

async function endSleepSession(endTime = Date.now()) {
    if (!sleepSession) return;

    const sessionToEnd = sleepSession;
    sleepSession = null;

    const durationSeconds = Math.floor(
        (endTime - sessionToEnd.startTime) / 1000
    );

    if (durationSeconds < 1) return;

    try {
        const sessions = await getPendingSessions();

        sessions.push({
            localId: crypto.randomUUID(),
            appName: "Sleep",
            activityType: "sleep",
            startTime: sessionToEnd.startTime,
            endTime,
            durationSeconds
        });

        await fs.writeFile(
            sessionsFile,
            JSON.stringify(sessions, null, 2)
        );

        console.log("Sleep session completed:", durationSeconds);

        await uploadPendingSessions();

    } catch (error) {
        console.error("Sleep session save error:", error);
    }
}

async function endLockedSession(endTime = Date.now()) {
    if (!lockedSession) return;

    const sessionToEnd = lockedSession;
    lockedSession = null;

    const durationSeconds = Math.floor(
        (endTime - sessionToEnd.startTime) / 1000
    );

    if (durationSeconds < 1) return;

    try {
        const sessions = await getPendingSessions();

        sessions.push({
            localId: crypto.randomUUID(),
            appName: "Locked",
            activityType: "locked",
            startTime: sessionToEnd.startTime,
            endTime,
            durationSeconds
        });

        await fs.writeFile(
            sessionsFile,
            JSON.stringify(sessions, null, 2)
        );

        console.log("Locked session completed:", durationSeconds);

        await uploadPendingSessions();

    } catch (error) {
        console.error("Locked session save error:", error);
    }
}

async function handleLockStart(startTime) {
    if (lockedSession || sleepSession) return;

    if (currentSession) {
        await endCurrentSession(startTime);
    }

    if (idleSession) {
        await endIdleSession(startTime);
    }

    lockedSession = { startTime };

    console.log("Lock tracking started");
}

async function handleLockEnd(endTime) {
    if (!lockedSession) return;

    await endLockedSession(endTime);

    console.log("Lock tracking stopped");
}

async function handleSleepStart(startTime) {
    if (sleepSession) return;

    if (currentSession) {
        await endCurrentSession(startTime);
    }

    if (idleSession) {
        await endIdleSession(startTime);
    }

    if (lockedSession) {
        await endLockedSession(startTime);
    }

    sleepSession = { startTime };

    console.log("Sleep tracking started");
}

async function handleSleepEnd(endTime) {
    if (!sleepSession) return;

    await endSleepSession(endTime);
    idleSeconds = 0;

    console.log("Sleep tracking stopped");
}


async function trackActiveApplication() {
    if (isTracking) return;

    isTracking = true;

    try {
        const window = await activeWindow();
        const currentApp = window?.owner?.name || null;

        if (currentApp !== currentSession?.appName) {
            console.log("Foreground application detected:", {
                appName: window?.owner?.name,
                appPath: window?.owner?.path,
                processId: window?.owner?.processId
            });
        }

        // Check lock screen first
        if (currentApp === "LockApp.exe") {
            if (currentSession) {
                await endCurrentSession();
            }

            if (idleSession) {
                await endIdleSession();
            }

            if (!lockedSession) {
                lockedSession = { startTime: Date.now() };
                console.log("Lock tracking started");
            }

            lastActivityState = "locked";
            return;
        }

        // No foreground application detected
        if (!currentApp) {
            lastActivityState = "active";
            return;
        }

        // Lock screen exited
        if (lockedSession) {
            await endLockedSession();
            console.log("Lock tracking stopped");
        }

        // Check idle state
        if (idleSeconds >= 60) {
            const idleStartTime = Date.now() - idleSeconds * 1000;

            if (currentSession) {
                await endCurrentSession(idleStartTime);
            }

            if (!idleSession) {
                idleSession = { startTime: idleStartTime };
                console.log("Idle tracking started");
            }

            lastActivityState = "idle";
            return;
        }

        if (idleSession) {
            await endIdleSession();
            console.log("Idle tracking stopped");
        }

        if (currentSession?.appName === currentApp) {
            lastActivityState = "active";
            return;
        }

        if (currentSession) {
            await endCurrentSession();
        }

        currentSession = {
            appName: currentApp,
            startTime: Date.now()
        };

        lastActivityState = "active";

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


