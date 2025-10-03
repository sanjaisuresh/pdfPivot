// models/ShareLink.js
const mongoose = require("mongoose");

const ShareLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  filePath: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports= mongoose.model("ShareLink", ShareLinkSchema);
