const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const { verifyToken } = require("../middleware/authMiddleware");
const { sendSMS } = require("../utils/sendSMS");

// ✅ GET — Patient ke saare appointments
router.get("/my", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialization phone")
      .populate("hospital", "name city address phone")
      .sort({ date: -1 });

    return res.json({ success: true, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Hospital ke saare appointments (hospital user dekhega)
router.get("/hospital", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.body.hospitalId || req.query.hospitalId })
      .populate("patient", "name email")
      .populate("doctor", "name specialization")
      .sort({ date: 1 });

    return res.json({ success: true, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Ek doctor ke available slots
router.get("/slots/:doctorId", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date required" });

    // Us din ke already booked slots
    const booked = await Appointment.find({
      doctor: req.params.doctorId,
      date: new Date(date),
      status: { $ne: "cancelled" }
    }).select("time");

    const bookedTimes = booked.map(a => a.time);

    // Available slots — 9 AM to 5 PM, 30 min interval
    const allSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
      "16:00", "16:30", "17:00"
    ];

    const availableSlots = allSlots.map(slot => ({
      time: slot,
      available: !bookedTimes.includes(slot)
    }));

    return res.json({ success: true, date, slots: availableSlots });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ POST — New appointment book karo
router.post("/book", verifyToken, async (req, res) => {
  try {
    const { doctorId, hospitalId, date, time, reason, patientPhone } = req.body;

    if (!doctorId || !hospitalId || !date || !time) {
      return res.status(400).json({ message: "Doctor, hospital, date, time required" });
    }

    // Check karo slot available hai
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $ne: "cancelled" }
    });

    if (existing) {
      return res.status(409).json({ message: "Ye slot already booked hai! Doosra time choose karo." });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      hospital: hospitalId,
      date: new Date(date),
      time,
      reason: reason || "General Checkup",
      status: "pending"
    });

    // Doctor aur Hospital details lo SMS ke liye
    const doctor = await Doctor.findById(doctorId).select("name specialization");
    const hospital = await Hospital.findById(hospitalId).select("name city phone");

    // ✅ Patient ko SMS bhejo confirmation
    if (patientPhone) {
      const dateFormatted = new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });

      await sendSMS(patientPhone,
        `✅ Appointment Confirmed!\nHospTrack\n\nDoctor: ${doctor?.name || 'Doctor'}\nSpecialization: ${doctor?.specialization || ''}\nHospital: ${hospital?.name || 'Hospital'}, ${hospital?.city || ''}\nDate: ${dateFormatted}\nTime: ${time}\n\nPlease arrive 15 mins early.\nHospTrack System`
      );
    }

    // ✅ Hospital ko SMS bhejo naye appointment ka
    if (hospital?.phone) {
      await sendSMS(hospital.phone,
        `📅 New Appointment\nHospTrack Alert\n\nNew appointment booked for Dr. ${doctor?.name || 'Doctor'}\nDate: ${date}\nTime: ${time}\nReason: ${reason || 'General Checkup'}\n\nPlease confirm in dashboard.\nHospTrack System`
      );
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked! SMS confirmation bheja gaya.",
      appointment: {
        id: appointment._id,
        date, time,
        doctor: doctor?.name,
        hospital: hospital?.name,
        status: "pending"
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Appointment status update (hospital/admin)
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("patient", "name").populate("doctor", "name").populate("hospital", "name");

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    return res.json({ success: true, message: `Appointment ${status}!`, appointment });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ DELETE — Appointment cancel karo
router.delete("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    return res.json({ success: true, message: "Appointment cancelled!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — All appointments (Admin)
router.get("/all", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });

    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name specialization")
      .populate("hospital", "name city")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;