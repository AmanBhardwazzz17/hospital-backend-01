const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String },

  // ✅ Bed Info
  totalBeds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 },
  icuTotal: { type: Number, default: 0 },
  icuAvailable: { type: Number, default: 0 },
  oxygenTotal: { type: Number, default: 0 },
  oxygenAvailable: { type: Number, default: 0 },
  ventilatorTotal: { type: Number, default: 0 },
  ventilatorAvailable: { type: Number, default: 0 },

  // ✅ Status
  emergencyAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },

  // ✅ Location
  latitude: { type: Number },
  longitude: { type: Number },

  // ✅ Managed by hospital user
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

}, { timestamps: true });

module.exports = mongoose.model("Hospital", hospitalSchema);