const mongoose = require("mongoose");

const esignDocSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    settings: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const EsignDoc = mongoose.model("esign-doc", esignDocSchema);

module.exports = EsignDoc;
