const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");
const { verifyToken, adminOnly, hospitalOnly } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /api/hospitals/beds:
 *   get:
 *     summary: Get all hospitals bed availability
 *     tags: [Hospitals]
 *     responses:
 *       200:
 *         description: List of hospitals with bed data
 */

/**
 * @swagger
 * /api/hospitals/add:
 *   post:
 *     summary: Add new hospital (Admin only)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Hospital added successfully
 */

/**
 * @swagger
 * /api/hospitals/update-beds/{id}:
 *   put:
 *     summary: Update hospital bed availability
 *     tags: [Hospitals]
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
 *         description: Beds updated successfully
 */

// ✅ GET — Sab hospitals ki bed availability (public)
router.get("/beds", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
      .select("name city address phone totalBeds availableBeds icuTotal icuAvailable oxygenTotal oxygenAvailable ventilatorTotal ventilatorAvailable emergencyAvailable updatedAt")
      .sort({ availableBeds: -1 });

    return res.json({
      success: true,
      total: hospitals.length,
      hospitals,
      lastUpdated: new Date()
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Single hospital detail
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    return res.json({ success: true, hospital });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ POST — Admin new hospital add kare
router.post("/add", verifyToken, adminOnly, async (req, res) => {
  try {
    const {
      name, address, city, phone,
      totalBeds, availableBeds,
      icuTotal, icuAvailable,
      oxygenTotal, oxygenAvailable,
      ventilatorTotal, ventilatorAvailable,
      emergencyAvailable, latitude, longitude
    } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({ message: "Name, address, city required" });
    }

    const hospital = await Hospital.create({
      name, address, city, phone,
      totalBeds: totalBeds || 0,
      availableBeds: availableBeds || 0,
      icuTotal: icuTotal || 0,
      icuAvailable: icuAvailable || 0,
      oxygenTotal: oxygenTotal || 0,
      oxygenAvailable: oxygenAvailable || 0,
      ventilatorTotal: ventilatorTotal || 0,
      ventilatorAvailable: ventilatorAvailable || 0,
      emergencyAvailable: emergencyAvailable !== false,
      latitude, longitude
    });

    // ✅ Real-time — naya hospital sabko dikhao
    const io = req.app.get('io');
    io.emit('hospital-added', hospital);

    return res.status(201).json({ success: true, message: "Hospital added!", hospital });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Hospital user apni bed availability update kare
router.put("/update-beds/:id", verifyToken, async (req, res) => {
  try {
    const {
      availableBeds, icuAvailable,
      oxygenAvailable, ventilatorAvailable,
      emergencyAvailable
    } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        availableBeds, icuAvailable,
        oxygenAvailable, ventilatorAvailable,
        emergencyAvailable,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // ✅ Real-time — bed update sabko instantly bhejo
    const io = req.app.get('io');
    io.emit('bed-updated', {
      hospitalId: hospital._id,
      name: hospital.name,
      availableBeds: hospital.availableBeds,
      icuAvailable: hospital.icuAvailable,
      oxygenAvailable: hospital.oxygenAvailable,
      ventilatorAvailable: hospital.ventilatorAvailable,
      emergencyAvailable: hospital.emergencyAvailable,
      updatedAt: hospital.updatedAt
    });

    return res.json({ success: true, message: "Beds updated!", hospital });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ DELETE — Admin hospital delete kare
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);

    // ✅ Real-time — deleted hospital sabke screen se hatao
    const io = req.app.get('io');
    io.emit('hospital-deleted', { hospitalId: req.params.id });

    return res.json({ success: true, message: "Hospital deleted!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;