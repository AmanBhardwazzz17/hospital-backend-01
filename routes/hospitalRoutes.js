const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// ✅ GET — Sab hospitals ki bed availability (public, sirf approved)
router.get("/beds", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true, approvalStatus: "approved" })
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

// ✅ GET — Pending hospitals (Admin only)
router.get("/pending", verifyToken, adminOnly, async (req, res) => {
  try {
    const hospitals = await Hospital.find({ approvalStatus: "pending" })
      .sort({ appliedAt: -1 });
    return res.json({ success: true, total: hospitals.length, hospitals });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — All hospitals (Admin only)
router.get("/all", verifyToken, adminOnly, async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .sort({ createdAt: -1 });
    return res.json({ success: true, total: hospitals.length, hospitals });
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

// ✅ POST — Public hospital registration apply (from hospital-register.html)
router.post("/apply", async (req, res) => {
  try {
    const {
      name, address, city, phone, email,
      totalBeds, availableBeds, icuTotal, icuAvailable, oxygenTotal, oxygenAvailable, ventilatorTotal, ventilatorAvailable, emergencyAvailable,
      latitude, longitude,
      // Hospital user account
      adminName, state, pinCode, hospitalType, registrationNumber, departments, notes
    } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({ message: "Name, address, city required" });
    }

    // Check duplicate hospital
    const existing = await Hospital.findOne({ name, city });
    if (existing) {
      return res.status(409).json({ message: "Ye hospital already registered hai" });
    }

    // Hospital document create karo
    const hospital = await Hospital.create({
      name, address, city, phone, email,
      totalBeds: totalBeds || 0,
      availableBeds: totalBeds || 0,
      icuTotal: icuTotal || 0,
      icuAvailable: icuTotal || 0,
      oxygenTotal: oxygenTotal || 0,
      oxygenAvailable: oxygenTotal || 0,
      ventilatorTotal: ventilatorTotal || 0,
      ventilatorAvailable: ventilatorTotal || 0,
      latitude, longitude,
      approvalStatus: "pending",
      appliedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted! Admin approval ka wait karo.",
      hospitalId: hospital._id
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Admin hospital approve kare
router.put("/approve/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "approved",
        isActive: true,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // Socket.IO se sabko notify karo
    const io = req.app.get('io');
    if (io) io.emit('hospital-approved', hospital);

    return res.json({ success: true, message: "Hospital approved!", hospital });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Admin hospital reject kare
router.put("/reject/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "rejected",
        isActive: false,
        rejectionReason: reason || "Admin ne reject kiya"
      },
      { new: true }
    );

    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    return res.json({ success: true, message: "Hospital rejected!", hospital });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ POST — Admin new hospital add kare (direct, auto approved)
router.post("/add", verifyToken, adminOnly, async (req, res) => {
  try {
    const {
  name, address, city, phone, email, password,
  totalBeds, availableBeds, icuTotal, icuAvailable,
  oxygenTotal, oxygenAvailable, ventilatorTotal, ventilatorAvailable,
  emergencyAvailable, latitude, longitude,
  adminName, state, pinCode, hospitalType, registrationNumber, departments, notes
} = req.body;

if (!name || !address || !city) {
  return res.status(400).json({ message: "Name, address, city required" });
}
    const hospital = await Hospital.create({
  name, address, city, phone, email,
  totalBeds: totalBeds || 0,
  availableBeds: availableBeds || totalBeds || 0,
  icuTotal: icuTotal || 0,
  icuAvailable: icuAvailable || icuTotal || 0,
  oxygenTotal: oxygenTotal || 0,
  oxygenAvailable: oxygenAvailable || oxygenTotal || 0,
  ventilatorTotal: ventilatorTotal || 0,
  ventilatorAvailable: ventilatorAvailable || ventilatorTotal || 0,
  emergencyAvailable: emergencyAvailable !== false,
  latitude, longitude,
  approvalStatus: "pending",
  appliedAt: new Date(),
});

    const io = req.app.get('io');
    if (io) io.emit('hospital-added', hospital);

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

    const io = req.app.get('io');
    if (io) io.emit('bed-updated', {
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
    const io = req.app.get('io');
    if (io) io.emit('hospital-deleted', { hospitalId: req.params.id });
    return res.json({ success: true, message: "Hospital deleted!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;