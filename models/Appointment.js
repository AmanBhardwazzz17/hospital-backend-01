const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // ✅ Patient Info
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
    },
    // ✅ Doctor & Hospital
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    doctorName: {
      type: String,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    // ✅ Appointment Details
    department: {
      type: String,
      enum: [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "General Medicine",
        "Gynecology",
        "Dermatology",
        "ENT",
        "Ophthalmology",
        "Psychiatry",
        "Emergency",
        "Other",
      ],
    },
    appointmentType: {
      type: String,
      enum: ["OPD", "Emergency", "Follow-up", "Checkup"],
      default: "OPD",
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    // ✅ Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    // ✅ Notes
    symptoms: {
      type: String,
    },
    notes: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);