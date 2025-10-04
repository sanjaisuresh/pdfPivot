const fs = require("fs").promises;
const path = require("path");
const { checkEsignDir } = require("../utils/uploadDIR");

const uploadPdf = async (params) => {
  try {
    let { originalname, buffer } = params;

    let user_id = "123";
    let random_id = "523";

    // Check file directory
    await checkEsignDir();

    // Generate path /uploads/esign-docs/temp-doc
    const temp_path = path.join(
      __dirname,
      "..",
      "uploads",
      "esign-docs",
      "temp-doc"
    );

    // File Name
    const file_name = `${originalname}-${user_id}-${random_id}.pdf`;
    // File Path
    const file_path = path.join(temp_path, file_name);

    await fs.writeFile(file_path, buffer);

    let result = {
      status: "success",
      message: "Successfully uploaded",
      data: {
        file_name: originalname,
        file_path: `/uploads/esign-docs/temp-doc/${file_name}`,
      },
    };
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadPdf,
};
