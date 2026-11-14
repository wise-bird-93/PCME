
const express = require("express");
const router = express.Router();

const {
    getUsageAnalytics
} = require("../controllers/analyticsController");

router.get("/usage/analytics", getUsageAnalytics);

module.exports = router;
