const { uploadPdf, sharePdf } = require("../services/esignServices");

const uploadPdfController = async (req, res) => {
  try {
    let { originalname, buffer, mimetype, encoding } = req.file;

    let user_id = "123";

    let params = {};

    params.originalname = originalname;
    params.buffer = buffer;
    params.mimetype = mimetype;
    params.encoding = encoding;
    params.user_id = user_id;

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

const sharePdfController = async (req, res) => {
  try {
    let { file_path, file_name, shared_users, settings } = req.body;

    let user_id = "123";

    let params = {};

    params.file_path = file_path;
    params.file_name = file_name;
    params.shared_users = shared_users;
    params.settings = settings;
    params.user_id = user_id;

    let result = await sharePdf(params);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error while sharing pdf document", error);
    res.status(400).json({
      status: "false",
      message: "Failed to Share Pdf",
    });
  }
};

module.exports = {
  uploadPdfController,
  sharePdfController,
};
