const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ POST — Patient appointment book kare
router.post("/book", verifyToken, async (req, res) => {
  try {
    const {
      hospitalId, doctorName, department,
      appointmentType, appointmentDate, appointmentTime,
      symptoms, notes
    } = req.body;

    if (!hospitalId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "Hospital, date aur time zaroori hai!" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName: req.user.name || "Patient",
      hospitalId,
      doctorName,
      department,
      appointmentType: appointmentType || "OPD",
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      symptoms,
      notes,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "✅ Appointment booked successfully!",
      appointment
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Patient ki apni appointments
router.get("/my", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("hospitalId", "name city address phone")
      .sort({ appointmentDate: -1 });

    return res.json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Single appointment detail
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("hospitalId", "name city address phone");

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({ success: true, appointment });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Appointment cancel karo
router.put("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Completed appointment cancel nahi ho sakti" });
    }

    appointment.status = "cancelled";
    appointment.cancelReason = req.body.reason || "Patient ne cancel kiya";
    await appointment.save();

    return res.json({ success: true, message: "Appointment cancelled!", appointment });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Hospital ki appointments (hospital staff ke liye)
router.get("/hospital/:hospitalId", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospitalId: req.params.hospitalId })
      .populate("patientId", "name email")
      .sort({ appointmentDate: 1 });

    return res.json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;