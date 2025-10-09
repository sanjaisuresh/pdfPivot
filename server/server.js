require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const fs = require("fs");
const puppeteer = require("puppeteer");
const cron = require("node-cron");
const ShareLink = require("./models/Sharelinks");
// Connect to database
connectDB();

const app = express();

const imageRoutes = require("./routes/imageRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const pdfRoutes = require("./routes/pdf");
const esignRoutes = require("./routes/esignRoutes");
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
