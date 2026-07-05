const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // ✅ Basic Info
    name: {
      type: String,
      required: true,
    },
    email: {
  type: String,
  unique: true,
  sparse: true, // ✅ null values allow karega
  },
    phone: {
      type: String,
    },
    // ✅ Professional Info
    specialization: {
      type: String,
      required: true,
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
        "Oncology",
        "Urology",
        "Emergency Medicine",
        "Other"
      ],
    },
    registrationNumber: {
  type: String,
  unique: true,
  sparse: true, // ✅ ye bhi add karo
},
    experience: {
      type: Number, // years
      default: 0,
    },
    qualification: {
      type: String, // MBBS, MD, MS etc
    },
    // ✅ Hospital Link
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    // ✅ Availability
    status: {
      type: String,
      enum: ["available", "busy", "in-surgery", "off-duty"],
      default: "available",
    },
    availableDays: {
      type: [String], // ["Monday", "Tuesday", ...]
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    availableTime: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    // ✅ Stats
    totalPatients: {
      type: Number,
      default: 0,
    },
    todayPatients: {
      type: Number,
      default: 0,
    },
    // ✅ Active Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);