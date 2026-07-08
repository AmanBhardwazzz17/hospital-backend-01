const mongoose = require("mongoose");
const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  description: { type: String },
  totalBeds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 },
  icuTotal: { type: Number, default: 0 },
  icuAvailable: { type: Number, default: 0 },
  oxygenTotal: { type: Number, default: 0 },
  oxygenAvailable: { type: Number, default: 0 },
  ventilatorTotal: { type: Number, default: 0 },
  ventilatorAvailable: { type: Number, default: 0 },
  emergencyAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  // ✅ NEW — Approval System
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  },
  rejectionReason: { type: String },
  appliedAt: { type: Date },
  approvedAt: { type: Date },
  latitude: { type: Number },
  longitude: { type: Number },
  contactPassword: { type: String },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
}, { timestamps: true });
module.exports = mongoose.model("Hospital", hospitalSchema);