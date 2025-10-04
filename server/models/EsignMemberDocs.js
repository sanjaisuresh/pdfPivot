const mongoose = require("mongoose");

const esignMembersDocSchema = new mongoose.Schema(
  {
    file_id: {
      type: String,
      required: true,
      index: true,
    },
    user_name: {
      type: String,
      default: "Unknown",
    },
    email_id: {
      type: String,
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    original_file_path: {
      type: String,
      required: true,
    },
    signed_file_path: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "signed", "expired"],
      default: "pending",
    },
    next_id: {
      type: String,
      default: null,
    },
    user_password: {
      type: String,
      default: null,
    },
    user_validation: {
      type: Array,
      default: null,
    },
    user_role: {
      type: String,
      enum: ["signer", "viewer", "validator"],
    },
  },
  {
    timestamps: true,
  }
);

const EsignMembersDoc = mongoose.model(
  "esign-member-doc",
  esignMembersDocSchema
);

module.exports = EsignMembersDoc;
