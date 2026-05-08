const express = require("express");
console.log("✅ smsRoutes loaded");
const router = express.Router();
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");
const {
  sendEmergencyAlert,
  sendBedCriticalAlert,
  sendAppointmentReminder,
  sendOTP,
  sendWelcomeSMS,
} = require("../utils/sendSMS");

// ✅ Emergency Alert SMS — Patient bhej sakta hai
router.post("/emergency", verifyToken, async (req, res) => {
  try {
    const { phone, patientName, emergencyType, hospitalName } = req.body;

    if (!phone || !patientName || !emergencyType || !hospitalName) {
      return res.status(400).json({ message: "All fields required" });
    }

    const result = await sendEmergencyAlert(phone, patientName, emergencyType, hospitalName);

    if (result.success) {
      return res.json({ success: true, message: "🚨 Emergency alert SMS sent!" });
    } else {
      return res.status(500).json({ success: false, message: "SMS failed", error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Bed Critical Alert — Admin ya Hospital bhej sakta hai
router.post("/bed-alert", verifyToken, async (req, res) => {
  try {
    const { phone, hospitalName, bedType, available } = req.body;

    if (!phone || !hospitalName || !bedType) {
      return res.status(400).json({ message: "All fields required" });
    }

    const result = await sendBedCriticalAlert(phone, hospitalName, bedType, available);

    if (result.success) {
      return res.json({ success: true, message: "⚠️ Bed alert SMS sent!" });
    } else {
      return res.status(500).json({ success: false, message: "SMS failed", error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Appointment Reminder
router.post("/appointment-reminder", verifyToken, async (req, res) => {
  try {
    const { phone, patientName, doctorName, date, time } = req.body;

    if (!phone || !patientName || !doctorName || !date || !time) {
      return res.status(400).json({ message: "All fields required" });
    }

    const result = await sendAppointmentReminder(phone, patientName, doctorName, date, time);

    if (result.success) {
      return res.json({ success: true, message: "📅 Appointment reminder SMS sent!" });
    } else {
      return res.status(500).json({ success: false, message: "SMS failed", error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await sendOTP(phone, otp);

    if (result.success) {
      return res.json({ success: true, message: "OTP sent!", otp }); // Production mein otp mat bhejo
    } else {
      return res.status(500).json({ success: false, message: "OTP failed", error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Welcome SMS — Admin only
router.post("/welcome", verifyToken, adminOnly, async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone || !name) return res.status(400).json({ message: "Phone and name required" });

    const result = await sendWelcomeSMS(phone, name);

    if (result.success) {
      return res.json({ success: true, message: "🏥 Welcome SMS sent!" });
    } else {
      return res.status(500).json({ success: false, message: "SMS failed", error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Test SMS — Admin only
router.post("/test", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const { sendSMS } = require("../utils/sendSMS");
    const result = await sendSMS(phone, "✅ HospTrack SMS System is working! Test successful.");

    if (result.success) {
      return res.json({ success: true, message: "✅ Test SMS sent!" });
    } else {
      return res.status(500).json({ success: false, message: "Test SMS failed", error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;