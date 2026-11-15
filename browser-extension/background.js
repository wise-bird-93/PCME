importScripts("./config.js");

console.log("PCME Usage Tracker - Backend Connected");

// Replace this with the Gmail account connected to PCME.
const PCME_EMAIL = globalThis.PCME_EMAIL;
const API_URL = "https://pcme.onrender.com/usage/sessions";

let isWindowFocused = true;
let userState = "active";
let transitionQueue = Promise.resolve();
let isUploading = false;

chrome.runtime.onInstalled.addListener(() => {
    chrome.idle.setDetectionInterval(60);
    console.log("PCME idle detection enabled");
});

function queueTransition() {
    transitionQueue = transitionQueue
        .then(reconcileSession)
        .catch(error => console.error("Tracking error:", error));

    return transitionQueue;
}

async function getActiveDomain() {
    if (!isWindowFocused || userState !== "active") {
        return null;
    }

    const window = await chrome.windows.getLastFocused();

    if (
        window.id === chrome.windows.WINDOW_ID_NONE ||
        window.focused === false
    ) {
        return null;
    }

    const tabs = await chrome.tabs.query({
        active: true,
        windowId: window.id
    });

    if (!tabs.length || !tabs[0].url) return null;

    try {
        const url = new URL(tabs[0].url);

        if (!["http:", "https:"].includes(url.protocol)) {
            return null;
        }

        return url.hostname;
    } catch {
        return null;
    }
}

// Upload locally stored sessions to the backend.
async function uploadUsageSessions() {
    if (isUploading) return;

    if (
        !PCME_EMAIL || PCME_EMAIL.includes("YOUR_CONNECTED")) {
        console.error("Please configure PCME_EMAIL first.");
        return;
    }

    isUploading = true;

    try {
        const data = await chrome.storage.local.get("usageSessions");
        const sessions = data.usageSessions || [];

        if (sessions.length === 0) return;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: PCME_EMAIL,
                sessions
            })
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        // Remove only the sessions included in this upload.
        const uploadedIds = new Set(
            sessions.map(session => session.localId)
        );

        const latestData = await chrome.storage.local.get("usageSessions");
        const latestSessions = latestData.usageSessions || [];

        const remainingSessions = latestSessions.filter(
            session => !uploadedIds.has(session.localId)
        );

        await chrome.storage.local.set({
            usageSessions: remainingSessions
        });

        console.log("Uploaded sessions:", sessions.length);

    } catch (error) {
        console.error("Usage upload failed. Sessions retained:", error);
    } finally {
        isUploading = false;
    }
}

async function endSession(session) {
    const endTime = Date.now();
    const durationMs = endTime - session.startTime;

    if (durationMs < 1000) {
        console.log("Ignored short session:", session.domain);
        return;
    }

    const data = await chrome.storage.local.get("usageSessions");
    const sessions = data.usageSessions || [];

    sessions.push({
        localId: crypto.randomUUID(),
        domain: session.domain,
        startTime: session.startTime,
        endTime,
        durationSeconds: Math.floor(durationMs / 1000)
    });

    await chrome.storage.local.set({
        usageSessions: sessions
    });

    console.log("Session saved:", session.domain);

    await uploadUsageSessions();
}

async function reconcileSession() {
    const nextDomain = await getActiveDomain();

    const data = await chrome.storage.local.get("currentSession");
    const currentSession = data.currentSession;

    if (
        currentSession &&
        currentSession.domain === nextDomain
    ) {
        return;
    }

    if (currentSession) {
        await endSession(currentSession);
        await chrome.storage.local.remove("currentSession");
    }

    if (nextDomain) {
        await chrome.storage.local.set({
            currentSession: {
                domain: nextDomain,
                startTime: Date.now()
            }
        });

        console.log("Tracking started:", nextDomain);
    }
}

// Chrome events with debounce.
let transitionTimer = null;

function scheduleTransition() {
    clearTimeout(transitionTimer);

    transitionTimer = setTimeout(() => {
        queueTransition();
    }, 300);
}

chrome.tabs.onActivated.addListener(scheduleTransition);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) {
        scheduleTransition();
    }
});

chrome.tabs.onRemoved.addListener(scheduleTransition);

chrome.windows.onFocusChanged.addListener(windowId => {
    isWindowFocused =
        windowId !== chrome.windows.WINDOW_ID_NONE;

    scheduleTransition();
});

chrome.idle.onStateChanged.addListener(state => {
    userState = state;
    scheduleTransition();
});

// Restore initial browser and idle state.
async function initializeTracker() {
    try {
        chrome.idle.setDetectionInterval(60);

        const state = await chrome.idle.queryState(60);
        userState = state;

        const window = await chrome.windows.getLastFocused();

        isWindowFocused =
            window.id !== chrome.windows.WINDOW_ID_NONE &&
            window.focused !== false;

        await uploadUsageSessions();
        await queueTransition();

    } catch (error) {
        console.error("Initialization error:", error);
    }
}

initializeTracker();

