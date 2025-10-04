const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { uploadPdfController } = require("../controller/esignController");
const uploadPdf = require("../middleware/csvUpload");

// Middleware
// router.use(auth);

router.post("/upload", uploadPdf.single("pdf-file"), uploadPdfController);

module.exports = router;
