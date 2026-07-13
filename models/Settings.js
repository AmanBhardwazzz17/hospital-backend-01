const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  emailNotifications: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
