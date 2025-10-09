require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const fs = require("fs");
const puppeteer = require("puppeteer");
const cron = require("node-cron");
const ShareLink = require("./models/Sharelinks");
const https = require("https");
// Connect to database
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

const imageRoutes = require("./routes/imageRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const pdfRoutes = require("./routes/pdf");
const esignRoutes = require("./routes/esignRoutes");
const { deleteTempPdf } = require("./services/cronJobs");
app.use(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" })
);

app.use(cors());
app.use(express.json({ limit: process.env.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "text/html" }));

// Static folder for serving HTML image screenshots
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
// app.use("/api", imageRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", pdfRoutes);
app.use("/api/esign", esignRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

cron.schedule("0 2 * * *", async () => {
  console.log("Running cleanup job...");
  const now = new Date();

  try {
    const expiredLinks = await ShareLink.find({ expiresAt: { $lte: now } });

    for (let link of expiredLinks) {
      try {
        if (fs.existsSync(link.filePath)) {
          fs.unlinkSync(link.filePath);
          console.log(`Deleted file: ${link.filePath}`);
        }
      } catch (err) {
        console.error("File deletion error:", err);
      }
      await ShareLink.deleteOne({ _id: link._id });
    }

    console.log("Cleanup completed.");
  } catch (err) {
    console.error("Cron cleanup error:", err);
  }
});

// CRON JOBS
cron.schedule("0 5 * * *", async () => {
  console.log("Running daily temp-doc cleanup at 5:00 AM...");
  await deleteTempPdf();
});

// Conditional HTTPS for production
if (process.env.NODE_ENV === "production") {
  const options = {
    key: fs.readFileSync("./certs/server.key"),
    cert: fs.readFileSync("./certs/server.crt"),
  };

  https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
    console.log(`HTTPS server running on port ${PORT}`);
  });
} else {
  // HTTP for development
  app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));
}
