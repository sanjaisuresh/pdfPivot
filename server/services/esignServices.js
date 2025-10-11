const fs = require("fs").promises;
const path = require("path");
const { checkEsignDir } = require("../utils/uploadDIR");
const EsignDoc = require("../models/EsignDoc");
const EsignMembersDoc = require("../models/EsignMemberDocs");
const User = require("../models/User");
const { eSignTemplate } = require("../utils/templates/esignShare");
const { sendMail } = require("../utils/mailService");

const uploadPdf = async (params) => {
  try {
    let { originalname, buffer, user_id } = params;

    let random_id = Date.now();

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

const renamePath = async (params) => {
  try {
    let { file_path, file_id } = params;

    let new_file_name = `${file_id}.pdf`;

    const new_path = path.join(
      __dirname,
      "..",
      "uploads",
      "esign-docs",
      "original-doc"
    );

    let old_path = path.join(__dirname, "..", file_path);

    const original_file_path = path.join(new_path, new_file_name);

    await fs.rename(old_path, original_file_path);

    return `/uploads/esign-docs/original-doc/${new_file_name}`;
  } catch (error) {
    throw error;
  }
};

const shareEmailAll = async (params) => {
  try {
    let { shared_users, file_path, file_name, file_id, owner_name } = params;
    let shared_ids = [];

    await Promise.all(
      shared_users.map(async (user) => {
        const shareDoc = await EsignMembersDoc.create({
          file_id: file_id,
          file_name: file_name,
          original_file_path: file_path,
          user_name: user.user_name,
          email_id: user.user_email,
          user_role: user.user_role,
          user_validation: user.user_validation,
          user_password: user.user_password,
        });

        shared_ids.push({ email: user.user_email, shared_id: shareDoc._id });

        // Email Format
        let email_payload = {
          owner_name: owner_name,
          member_name: user.user_name,
          member_email: user.user_email,
          pdf_id: shareDoc._id,
        };

        let email_html_format = eSignTemplate(email_payload);

        // Send Email
        // await sendMail(
        //   user.user_email,
        //   email_html_format.subject,
        //   email_html_format.html
        // );
      })
    );

    return shared_ids;
  } catch (error) {
    throw error;
  }
};

const shareOrderedEmail = async (params) => {
  try {
    let { shared_users, file_path, file_name, file_id, owner_name } = params;

    for (let i = 0; i < shared_users.length; i++) {

      let member_doc_payload = {
        file_id: file_id,
        file_name: file_name,
        original_file_path: file_path,
        user_name: shared_users[i].user_name,
        email_id: shared_users[i].user_email,
        user_role: shared_users[i].user_role,
        user_validation: shared_users[i].user_validation,
        user_password: shared_users[i].user_password,
      }
      const shareDoc = await EsignMembersDoc.create(member_doc_payload);

      if (i === 0) {
        // Email Format
        let email_payload = {
          owner_name: owner_name,
          member_name: shared_users[i].user_name,
          member_email: shared_users[i].user_email,
          pdf_id: shareDoc._id,
        };

        let email_html_format = eSignTemplate(email_payload);

        // Send Email
        // await sendMail(
        //   user.user_email,
        //   email_html_format.subject,
        //   email_html_format.html
        // );
      }
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const sharePdf = async (params) => {
  try {
    let { file_path, file_name, settings, user_id } = params;

    let save_pdf = await EsignDoc.create({
      user_id: user_id,
      file_name: file_name,
      file_path: file_path,
      settings: settings,
    });

    let file_id = save_pdf._id;

    let new_file_path = await renamePath({ file_id, file_path });

    params.file_path = new_file_path;

    await EsignDoc.updateOne(
      {
        _id: file_id,
      },
      {
        $set: { file_path: new_file_path },
      }
    );

    (async () => {
      console.log(settings);
      let setting_list = settings.map((k) => k.key);
      console.log(setting_list);
      params.file_id = file_id;

      // get owner user name
      let get_owner_name = await User.findOne(
        {
          _id: user_id,
        },
        {
          name: 1,
        }
      );

      let owner_name = get_owner_name?.name ?? "Unknown";

      params.owner_name = owner_name;

      if (!setting_list.includes("reorder")) {
        await shareEmailAll(params);
      }

      if (setting_list.includes("reorder")) {
        await shareOrderedEmail(params);
      }
    })();

    let result = {
      status: "success",
      message: "Pdf file shared successfully",
    };
    return result;
  } catch (error) {
    throw error;
  }
};

const sharedDocList = async (params) => {
  try {
    let { user_id } = params;

    let shared_docs = await EsignDoc.find(
      {
        user_id: user_id,
      },
      {
        _id: 1,
        user_id: 1,
        file_name: 1,
        file_path: 1,
        createdAt: 1,
      }
    );

    let result = {
      status: "success",
      message: "Shared PDF docs list.",
      data: shared_docs,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

const sharedDocInfoList = async (params) => {
  try {
    let { user_id, file_id } = params;

    let shared_docs_info = await EsignMembersDoc.find(
      {
        file_id: file_id,
      },
      {
        _id: 1,
        file_name: 1,
        signed_file_path: 1,
        status: 1,
        createdAt: 1,
        user_name: 1,
      }
    );

    let result = {
      status: "success",
      message: "Shared PDF docs info list.",
      data: shared_docs_info,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

const sharedDocInfo = async (params) => {
  try {
    let { shared_id } = params;

    let shared_docs_info = await EsignMembersDoc.findOne(
      {
        _id: shared_id,
      },
      {
        signed_file_path: 0,
        email_id: 0,
      }
    ).lean();

    shared_docs_info.user_password = !!(
      shared_docs_info.user_password &&
      shared_docs_info.user_password.length > 0
    );

    let result = {
      status: "success",
      message: "Shared PDF docs info.",
      data: shared_docs_info,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

const uploadSignedPdf = async (params) => {
  try {
    let { originalname, buffer, file_id } = params;

    // Edge case
    let file_info = await EsignMembersDoc.findOne({
      _id: file_id,
    });

    let file_status = file_info.status;

    if (file_status !== "pending") {
      throw new Error("PDF expired or already signed");
    }

    // Check file directory
    await checkEsignDir();

    // Generate path /uploads/esign-docs/temp-doc
    const save_path = path.join(
      __dirname,
      "..",
      "uploads",
      "esign-docs",
      "signed-doc"
    );

    // File Name
    const file_name = `${file_id}.pdf`;
    // File Path
    const file_path = path.join(save_path, file_name);

    await fs.writeFile(file_path, buffer);

    // update status signed and path
    await EsignMembersDoc.updateOne(
      {
        _id: file_id,
      },
      {
        $set: {
          status: "signed",
          signed_file_path: `/uploads/esign-docs/signed-doc/${file_name}`,
        },
      }
    );

    let result = {
      status: "success",
      message: "Successfully uploaded",
      data: {
        file_name: originalname,
        file_path: `/uploads/esign-docs/signed-doc/${file_name}`,
      },
    };
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadPdf,
  sharePdf,
  sharedDocList,
  sharedDocInfoList,
  sharedDocInfo,
  uploadSignedPdf,
};
