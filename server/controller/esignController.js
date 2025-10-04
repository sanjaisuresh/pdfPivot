const {
  uploadPdf,
  sharePdf,
  sharedDocList,
  sharedDocInfoList,
} = require("../services/esignServices");
const fs = require("fs").promises;
const path = require("path");

const uploadPdfController = async (req, res) => {
  try {
    let { originalname, buffer, mimetype, encoding } = req.file;

    let { _id: user_id } = req.user;

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

    let { _id: user_id } = req.user;

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

const getSharedFileController = async (req, res) => {
  try {
    let { _id: user_id } = req.user;

    let params = {};

    params.user_id = user_id;

    let result = await sharedDocList(params);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error while getting shared pdf document", error);
    res.status(400).json({
      status: "false",
      message: "Failed to Fetch Shared Pdf",
    });
  }
};

const getSharedFileInfoController = async (req, res) => {
  try {
    let { file_id } = req.query;
    let { _id: user_id } = req.user;

    let params = {};

    params.user_id = user_id;
    params.file_id = file_id;

    let result = await sharedDocInfoList(params);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error while getting shared document info", error);
    res.status(400).json({
      status: "false",
      message: "Failed to Fetch Shared Pdf info",
    });
  }
};

const downloadPdfController = async (req, res) => {
  try {
    let { file_path } = req.body;

    const download_path = path.resolve(__dirname, "..", "." + file_path);

    res.sendFile(download_path, (err) => {
      if (err) {
        console.error(err);
        res.status(404).send("File not found");
      }
    });
  } catch (error) {
    console.error("Error while downloading pdf document", error);
    res.status(400).json({
      status: "false",
      message: "download failed",
    });
  }
};

module.exports = {
  uploadPdfController,
  sharePdfController,
  getSharedFileController,
  getSharedFileInfoController,
  downloadPdfController,
};
