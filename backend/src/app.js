const express = require("express");
const cors = require("cors");
const gmailRoutes = require("./routes/gmailRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(gmailRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PCME Backend is running"
    });
});

module.exports = app;