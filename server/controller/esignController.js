const { uploadPdf } = require("../services/esignServices");

const uploadPdfController = async (req, res) => {
  try {
    let { originalname, buffer, mimetype, encoding } = req.file;

    let params = {};

    params.originalname = originalname;
    params.buffer = buffer;
    params.mimetype = mimetype;
    params.encoding = encoding;

    let result = await uploadPdf(params);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error while uploading pdf document");
    res.status(400).json({
      status: "false",
      message: "Upload failed",
    });
  }
};

module.exports = {
  uploadPdfController,
};
