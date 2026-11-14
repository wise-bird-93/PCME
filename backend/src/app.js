const express = require("express");
const cors = require("cors");
const gmailRoutes = require("./routes/gmailRoutes");
const usageRoutes = require("./routes/usageRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(gmailRoutes);
app.use(usageRoutes);
app.use(analyticsRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PCME Backend is running"
    });
});

module.exports = app;