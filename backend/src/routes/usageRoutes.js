
const express = require("express");
const router = express.Router();

const {
    saveUsageSessions
} = require("../controllers/usageController");

router.post("/usage/sessions", saveUsageSessions);

module.exports = router;
