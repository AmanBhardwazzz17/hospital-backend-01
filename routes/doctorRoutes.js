const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// ✅ GET — Saare doctors (with hospital filter)
router.get("/", async (req, res) => {
  try {
    const { hospitalId, specialization } = req.query;
    let filter = { isActive: true };
    if (hospitalId) filter.hospital = hospitalId;
    if (specialization) filter.specialization = { $regex: specialization, $options: "i" };

    const doctors = await Doctor.find(filter)
      .populate("hospital", "name city")
      .sort({ name: 1 });

    return res.json({ success: true, total: doctors.length, doctors });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Single doctor detail
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("hospital", "name city address phone");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ success: true, doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ POST — Doctor add karo (Admin only)
router.post("/add", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, specialization, hospital, phone, experience, availability, fee } = req.body;

    if (!name || !specialization || !hospital) {
      return res.status(400).json({ message: "Name, specialization, hospital required" });
    }

    const doctor = await Doctor.create({
      name, specialization, hospital, phone,
      experience: experience || 0,
      fee: fee || 0,
      availability: availability || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      isActive: true
    });

    return res.status(201).json({ success: true, message: "Doctor added!", doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Doctor update karo
router.put("/update/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ success: true, message: "Doctor updated!", doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ DELETE — Doctor remove karo
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    return res.json({ success: true, message: "Doctor removed!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;