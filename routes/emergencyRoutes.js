const express = require("express");
const router = express.Router();
const Emergency = require("../models/Emergency");
const { verifyToken } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /api/emergency/alert:
 *   post:
 *     summary: Send emergency alert
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Emergency alert sent
 */

/**
 * @swagger
 * /api/emergency/all:
 *   get:
 *     summary: Get all emergency cases
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of emergencies
 */

// ✅ POST — Emergency alert bhejo
router.post("/alert", verifyToken, async (req, res) => {
  try {
    const {
      patientName, patientAge, patientGender, patientPhone,
      emergencyType, severity, location, latitude, longitude,
      hospitalId, notes
    } = req.body;

    if (!patientName || !emergencyType || !severity) {
      return res.status(400).json({ message: "Patient name, emergency type, severity required" });
    }

    const emergency = await Emergency.create({
      patientName, patientAge, patientGender, patientPhone,
      emergencyType, severity, location, latitude, longitude,
      hospitalId, notes,
      status: "pending",
      ambulanceDispatched: false,
    });

    return res.status(201).json({
      success: true,
      message: "Emergency alert sent! Hospitals notified.",
      emergency,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Sab emergency cases
router.get("/all", verifyToken, async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json({ success: true, total: emergencies.length, emergencies });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Hospital ke emergency cases
router.get("/hospital/:hospitalId", verifyToken, async (req, res) => {
  try {
    const emergencies = await Emergency.find({ hospitalId: req.params.hospitalId })
      .sort({ createdAt: -1 });
    return res.json({ success: true, total: emergencies.length, emergencies });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Status update karo
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { status, assignedDoctor, ambulanceDispatched, ambulanceNumber, notes } = req.body;

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status, assignedDoctor,
        ambulanceDispatched, ambulanceNumber, notes,
        resolvedAt: status === "resolved" ? new Date() : undefined,
      },
      { new: true }
    );

    if (!emergency) return res.status(404).json({ message: "Emergency not found" });

    return res.json({ success: true, message: "Emergency updated!", emergency });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ DELETE — Emergency cancel karo
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Emergency.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Emergency cancelled!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;