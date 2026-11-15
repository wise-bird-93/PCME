const express = require("express");
const router = express.Router();

const {
    saveUsageSessions,
    getUsageTimeline
} = require("../controllers/usageController");

router.post("/usage/sessions", saveUsageSessions);
router.get("/usage/timeline", getUsageTimeline);

module.exports = router;