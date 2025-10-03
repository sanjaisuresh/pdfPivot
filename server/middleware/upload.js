const multer = require("multer");

// Use memory storage so we can access req.file.buffer directly
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
