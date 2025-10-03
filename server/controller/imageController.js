const sharp = require("sharp");

const convertImage = async (req, res) => {
  const file = req.file;
  const format = req.body.format || "png";
  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);
  const quality = parseInt(req.body.quality) || 80;

  if (!file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  try {
    // Use buffer instead of file.path
    const image = sharp(file.buffer);

    let transformed = image;

    if (width || height) {
      transformed = transformed.resize(width || null, height || null);
    }

    if (format === "jpg" || format === "jpeg") {
      transformed = transformed.jpeg({ quality });
    } else if (format === "png") {
      transformed = transformed.png({ quality });
    } else if (format === "webp") {
      transformed = transformed.webp({ quality });
    }

    const outputBuffer = await transformed.toBuffer();

    res.set("Content-Type", `image/${format}`);
    res.send(outputBuffer);
  } catch (err) {
    console.error("Image processing error:", err);
    res.status(500).json({ message: "Image processing failed" });
  }
};

const compressImage = async (req, res) => {
  const file = req.file;
  const quality = parseInt(req.body.quality) || 80;

  if (!file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  try {
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    const format = metadata.format;

    let transformed = image;
    
    if (format === "jpeg" || format === "jpg") {
      transformed = transformed.jpeg({ quality });
    } else if (format === "png") {
      transformed = transformed.png({ quality });
    } else if (format === "webp") {
      transformed = transformed.webp({ quality });
    }

    const outputBuffer = await transformed.toBuffer();

    res.set("Content-Type", `image/${format}`);
    res.send(outputBuffer);
  } catch (err) {
    console.error("Image compression error:", err);
    res.status(500).json({ message: "Image compression failed" });
  }
};

module.exports = { convertImage, compressImage };
