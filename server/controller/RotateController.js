const sharp = require("sharp");

const rotateImage = async (req, res) => {
  try {
    const rotation = parseInt(req.body.rotation) || 0;

    if (!req.file) {
      return res.status(400).send("No image uploaded.");
    }

    const imageBuffer = req.file.buffer;

    const rotatedImage = await sharp(imageBuffer)
      .rotate(rotation)
      .toFormat("png")
      .toBuffer();

    res.set("Content-Type", "image/png");
    res.send(rotatedImage);
  } catch (error) {
    console.error("Rotation failed:", error);
    res.status(500).send("Rotation failed.");
  }
};

module.exports = { rotateImage };
