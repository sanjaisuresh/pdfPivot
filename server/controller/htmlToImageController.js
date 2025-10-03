const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const htmlToImage = async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ message: "HTML content is required" });
  }

  try {
    const uploadsDir = path.join(__dirname, "../uploads");

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const screenshotPath = path.join(uploadsDir, `html_${Date.now()}.png`);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    await page.screenshot({ path: screenshotPath, fullPage: true });

    await browser.close();

    res.sendFile(screenshotPath);
  } catch (err) {
    console.error("HTML to image error:", err.message);
    res.status(500).json({ message: "Failed to generate image" });
  }
};

module.exports = { htmlToImage };
