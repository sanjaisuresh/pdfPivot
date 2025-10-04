const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  uploadPdfController,
  sharePdfController,
  getSharedFileController,
  getSharedFileInfoController,
  downloadPdfController,
  sharedPdfInfoController,
} = require("../controller/esignController");
const uploadPdf = require("../middleware/csvUpload");

router.post("/docs/download", downloadPdfController);

router.get("/share/docs/info", sharedPdfInfoController);

// Middleware
router.use(auth);

router.post("/upload", uploadPdf.single("pdf-file"), uploadPdfController);

router.post("/share", sharePdfController);

router.get("/owner-docs/list", getSharedFileController);

router.get("/owner-docs/file-info", getSharedFileInfoController);

module.exports = router;
