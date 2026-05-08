const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    // ✅ Patient Info
    patientName: {
      type: String,
      required: true,
    },
    patientAge: {
      type: Number,
    },
    patientGender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    patientPhone: {
      type: String,
    },
    // ✅ Emergency Details
    emergencyType: {
      type: String,
      required: true,
      enum: [
        "Heart Attack",
        "Head Injury",
        "Bone Fracture",
        "Heavy Bleeding",
        "Breathing Difficulty",
        "Pregnancy Emergency",
        "Unconscious / Stroke",
        "Accident",
        "Other",
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ["critical", "high", "medium"],
      default: "high",
    },
    // ✅ Location
    location: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    // ✅ Hospital & Doctor
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    // ✅ Status
    status: {
      type: String,
      enum: ["pending", "dispatched", "in-treatment", "resolved", "cancelled"],
      default: "pending",
    },
    // ✅ Ambulance
    ambulanceDispatched: {
      type: Boolean,
      default: false,
    },
    ambulanceNumber: {
      type: String,
    },
    // ✅ Notes
    notes: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);