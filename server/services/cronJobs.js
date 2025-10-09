const path = require("path");
const fs = require("fs").promises;

const deleteTempPdf = async () => {
  try {
    const tempDir = path.join(
      __dirname,
      "..",
      "uploads",
      "esign-docs",
      "temp-doc"
    );

    // Check if directory exists
    try {
      await fs.access(tempDir);
    } catch {
      console.log("Temp directory does not exist, nothing to delete.");
      return;
    }

    const files = await fs.readdir(tempDir);

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }

    console.log("All temp-doc files deleted successfully.");
  } catch (error) {
    console.error("Error deleting temp-doc files:", error);
  }
};

module.exports = {
  deleteTempPdf,
};
