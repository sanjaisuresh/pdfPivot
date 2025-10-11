const path = require("path");
const EsignCron = require("../models/EsignCron");
const EsignMembersDoc = require("../models/EsignMemberDocs");
const EsignDoc = require("../models/EsignDoc");
const User = require("../models/User");
const { eSignTemplate } = require("../utils/templates/esignShare");
const { sendMail } = require("../utils/mailService");
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

const esignExpired = async () => {
  try {
    const get_cron_info = await EsignCron.find({
      status: "active",
      cron_type: "expireDate",
    });

    for (const data of get_cron_info) {
      const current_date = new Date().toISOString().split("T")[0];
      if (current_date === data.next_notify) {
        await EsignMembersDoc.updateMany(
          {
            file_id: data.file_id,
          },
          { $set: { status: "expired" } }
        );

        await EsignCron.updateOne(
          {
            _id: data._id,
          },
          {
            $set: { status: "expired" },
          }
        );

        console.log("[CRON] - File expired. File id :" + data.file_id);
      }
    }

    console.log("[CRON] - esignExpired ran on  " + new Date());
  } catch (error) {
    console.error("Esign Expired Cron error: " + error);
  }
};

const esignReminder = async () => {
  try {
    const get_cron_info = await EsignCron.find({
      status: "active",
      cron_type: "reminder",
    });

    for (const data of get_cron_info) {
      const current_date = new Date().toISOString().split("T")[0];
      console.log(current_date);
      console.log(data);
      if (current_date === data.next_notify) {
        let get_file_info = await EsignDoc.findOne({
          _id: data.file_id,
        });

        let owner_id = get_file_info.user_id;

        let owner_name = await User.findOne({
          _id: owner_id,
        });

        let get_members = await EsignMembersDoc.find({
          status: "pending",
          file_id: data.file_id,
        });

        for (const member of get_members) {
          console.log(member);
          let email_payload = {
            owner_name: owner_name.name,
            member_name: member.user_name,
            member_email: member.email_id,
            pdf_id: member._id,
          };

          console.log(
            "[ESign Reminder] Mail Request (notify] : ",
            email_payload
          );

          let email_html_format = eSignTemplate(email_payload);

          email_html_format.subject = `Document Signature Remainder from ${owner_name.name}`;

          await sendMail(
            member.email_id,
            email_html_format.subject,
            email_html_format.html
          );
        }
      }
    }

    console.log("[CRON] - esign Remainder ran on  " + new Date());
  } catch (error) {
    console.error("Esign Remainder Cron error: " + error);
  }
};

module.exports = {
  deleteTempPdf,
  esignExpired,
  esignReminder,
};
