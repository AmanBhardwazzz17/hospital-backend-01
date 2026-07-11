const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // ✅ Role — admin, hospital, patient
    role: {
      type: String,
      enum: ["admin", "hospital", "patient"],
      default: "patient",
    },
    // ✅ Account active/inactive
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ Hospital ke liye — hospital ID
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },
    // ✅ Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
   verifyTokenExpiry: {
      type: Date,
    },
    // ✅ Profile Info
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    bloodGroup: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);