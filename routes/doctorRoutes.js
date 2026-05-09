const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { verifyToken, adminOnly, hospitalOnly } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /api/doctors/all:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of all doctors
 */

/**
 * @swagger
 * /api/doctors/add:
 *   post:
 *     summary: Add new doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Doctor added successfully
 */

/**
 * @swagger
 * /api/doctors/status/{id}:
 *   put:
 *     summary: Update doctor status
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

// ✅ GET — Sab doctors (public)
router.get("/all", async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate("hospitalId", "name city")
      .sort({ name: 1 });
    return res.json({ success: true, total: doctors.length, doctors });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Hospital ke doctors
router.get("/hospital/:hospitalId", async (req, res) => {
  try {
    const doctors = await Doctor.find({
      hospitalId: req.params.hospitalId,
      isActive: true
    }).sort({ name: 1 });
    return res.json({ success: true, total: doctors.length, doctors });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Single doctor
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("hospitalId", "name city");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ success: true, doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ POST — Doctor add karo (hospital/admin only)
router.post("/add", verifyToken, async (req, res) => {
  try {
    const {
      name, email, phone, specialization,
      registrationNumber, experience, qualification,
      hospitalId, availableDays, availableTime
    } = req.body;

    if (!name || !specialization || !hospitalId) {
      return res.status(400).json({ message: "Name, specialization, hospitalId required" });
    }

    const doctor = await Doctor.create({
      name, email, phone, specialization,
      registrationNumber, experience, qualification,
      hospitalId, availableDays, availableTime,
      status: "available",
      isActive: true,
    });

    return res.status(201).json({ success: true, message: "Doctor added!", doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Doctor status update karo
router.put("/status/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ success: true, message: "Status updated!", doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Doctor info update karo
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const {
      name, phone, specialization, experience,
      qualification, availableDays, availableTime, isActive
    } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { name, phone, specialization, experience, qualification, availableDays, availableTime, isActive },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ success: true, message: "Doctor updated!", doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ DELETE — Doctor remove karo
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Doctor removed!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;