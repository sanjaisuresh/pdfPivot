const fs = require("fs");
const path = require("path");

const checkEsignDir = async () => {
  // Base folder: uploads
  const uploadsPath = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // esign-docs folder
  const esignPath = path.join(uploadsPath, "esign-docs");
  if (!fs.existsSync(esignPath)) {
    fs.mkdirSync(esignPath, { recursive: true });
  }

  // original-doc folder
  const originalPath = path.join(esignPath, "original-doc");
  if (!fs.existsSync(originalPath)) {
    fs.mkdirSync(originalPath, { recursive: true });
  }

  // temp original-doc folder
  const tempPath = path.join(esignPath, "temp-doc");
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }

  // signed-doc folder
  const signedPath = path.join(esignPath, "signed-doc");
  if (!fs.existsSync(signedPath)) {
    fs.mkdirSync(signedPath, { recursive: true });
  }
};

module.exports = {
  checkEsignDir,
};
