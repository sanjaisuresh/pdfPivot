const mongoose = require("mongoose");

const esignCronSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    file_id: {
      type: String,
      required: true,
    },
    cron_type: {
      type: String,
      enum: ["reminder", "expireDate"],
      require: true,
    },
    notify_period: {
      type: Number,
      default: 0,
    },
    next_notify: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const EsignCron = mongoose.model("esign-cron", esignCronSchema);

module.exports = EsignCron;
