require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`PCME Backend running on port ${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
