const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { convertImage, compressImage } = require("../controller/imageController");
const { htmlToImage } = require("../controller/htmlToImageController");
const { rotateImage } = require("../controller/RotateController");


router.post("/convert", upload.single("image"), convertImage);
router.post("/compress", upload.single("image"), compressImage);
router.post("/html-to-image", htmlToImage);
router.post("/rotate", upload.single("image"), rotateImage);

module.exports = router;
