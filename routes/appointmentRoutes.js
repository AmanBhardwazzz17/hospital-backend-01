const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");
const { sendSMS } = require("../utils/sendSMS");

// ✅ GET — Patient ke saare appointments
router.get("/my", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name specialization phone")
      .populate("hospitalId", "name city address phone")
      .sort({ appointmentDate: -1 });

    return res.json({ success: true, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Available slots
router.get("/slots/:doctorId", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date required" });
    const booked = await Appointment.find({
      doctorId: req.params.doctorId,
      appointmentDate: new Date(date),
      status: { $ne: "cancelled" }
    }).select("appointmentTime");

    const bookedTimes = booked.map(a => a.appointmentTime);

    const allSlots = [
      "09:00","09:30","10:00","10:30","11:00","11:30",
      "12:00","12:30","14:00","14:30","15:00","15:30",
      "16:00","16:30","17:00"
    ];

    const slots = allSlots.map(slot => ({
      time: slot,
      available: !bookedTimes.includes(slot)
    }));

    return res.json({ success: true, date, slots });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
// ✅ GET — Public appointment verify (for QR scan)
router.get("/verify/:id", async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate("doctorId", "name specialization");
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });
    return res.json({ success: true, appointment: appt });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ PUT — Public check-in (for QR scan at reception)
router.put("/checkin/:id", async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed", checkedInAt: new Date() },
      { new: true }
    );
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });
    return res.json({ success: true, message: "Checked in!", appointment: appt });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ POST — Appointment book karo
router.post("/book", verifyToken, async (req, res) => {
  try {
    const { doctorId, hospitalId, date, time, reason, patientPhone, department } = req.body;

    if (!hospitalId || !date || !time) {
      return res.status(400).json({ message: "Hospital, date, time required" });
    }

    // Patient info lo
    const patient = await User.findById(req.user.id).select("name");

    // Slot already booked check
    if (doctorId) {
      const existing = await Appointment.findOne({
        doctorId,
        appointmentDate: new Date(date),
        appointmentTime: time,
        status: { $ne: "cancelled" }
      });
      if (existing) return res.status(409).json({ message: "Ye slot already booked hai! Doosra time choose karo." });
    }

    // Doctor details
    const doctor = doctorId ? await Doctor.findById(doctorId).select("name specialization") : null;
    const hospital = await Hospital.findById(hospitalId).select("name city phone");

    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName: patient?.name || "Patient",
      patientPhone: patientPhone || "",
      doctorId: doctorId || null,
      doctorName: doctor?.name || "To be assigned",
      hospitalId,
      appointmentDate: new Date(date),
      appointmentTime: time,
      department: department || doctor?.specialization || "General Medicine",
      symptoms: reason || "General Checkup",
      status: "pending"
    });

    // ✅ Patient ko SMS
    if (patientPhone) {
      const dateFormatted = new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      await sendSMS(patientPhone,
        `✅ Appointment Confirmed!\nHospTrack\n\nDoctor: ${doctor?.name || 'To be assigned'}\nHospital: ${hospital?.name}, ${hospital?.city}\nDate: ${dateFormatted}\nTime: ${time}\n\nPlease arrive 15 mins early.\nHospTrack System`
      );
    }

    // ✅ Hospital ko SMS
    if (hospital?.phone) {
      await sendSMS(hospital.phone,
        `📅 New Appointment\nPatient: ${patient?.name}\nDoctor: ${doctor?.name || 'Any'}\nDate: ${date}\nTime: ${time}\nReason: ${reason || 'General Checkup'}\nHospTrack System`
      );
    }

    // ✅ Socket.IO notification
    const io = req.app.get('io');
    if (io) {
      io.emit('appointment-booked', {
        hospitalId,
        patientName: patient?.name,
        doctorName: doctor?.name,
        date, time
      });
    }

    // ✅ Email notification
    const { sendAppointmentEmail } = require("../utils/sendEmail");
    await sendAppointmentEmail(
      patient?.name || "Patient",
      doctor?.name || "To be assigned",
      date,
      time,
      hospital?.name || "Hospital"
    );

    return res.json({ success: true,
      appointment: {
        id: appointment._id,
        date, time,
        doctor: doctor?.name || "To be assigned",
        hospital: hospital?.name,
        status: "pending"
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Status update
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!["pending","confirmed","completed","cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status, notes }, { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Not found" });
    return res.json({ success: true, message: `Appointment ${status}!`, appointment });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ DELETE — Cancel
router.delete("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id },
      { status: "cancelled" },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Not found" });
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
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization")
      .populate("hospitalId", "name city")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
// ✅ GET — Hospital ki appointments (hospital staff)
router.get("/hospital-appointments", verifyToken, async (req, res) => {
  try {
    // Hospital ka user find karo
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "hospital") {
      return res.status(403).json({ message: "Hospital access only" });
    }

    // Us hospital ki appointments fetch karo
    const Hospital = require("../models/Hospital");
    const hospital = await Hospital.findOne({ 
      $or: [
        { email: user.email },
        { _id: user.hospitalId }
      ]
    });

    let appointments;
    if (hospital) {
      appointments = await Appointment.find({ hospitalId: hospital._id })
        .populate("patientId", "name email phone")
        .populate("doctorId", "name specialization")
        .sort({ appointmentDate: 1 });
    } else {
      appointments = await Appointment.find()
        .populate("patientId", "name email phone")
        .populate("doctorId", "name specialization")
        .populate("hospitalId", "name city")
        .sort({ appointmentDate: 1 })
        .limit(50);
    }

    return res.json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = router;