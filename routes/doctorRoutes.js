const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// ✅ GET — Saare doctors
router.get("/", async (req, res) => {
  try {
    const { hospitalId, specialization } = req.query;
    let filter = { isActive: true };
    if (hospitalId) filter.hospitalId = hospitalId;
    if (specialization) filter.specialization = { $regex: specialization, $options: "i" };

    const doctors = await Doctor.find(filter)
      .populate("hospitalId", "name city")
      .sort({ name: 1 });

    return res.json({ success: true, total: doctors.length, doctors });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Single doctor
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("hospitalId", "name city address phone");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ success: true, doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ POST — Doctor add (Admin only)
router.post("/add", verifyToken, adminOnly, async (req, res) => {
  try {
    const {
      name, specialization, hospitalId,
      phone, email, experience,
      qualification, availableDays, registrationNumber
    } = req.body;

    if (!name || !specialization || !hospitalId) {
      return res.status(400).json({ message: "Name, specialization, hospitalId required" });
    }

    const doctorData = {
      name, specialization, hospitalId,
      phone: phone || "",
      experience: experience || 0,
      qualification: qualification || "MBBS",
      availableDays: availableDays || ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      isActive: true
    };

    // Optional fields — sirf add karo agar diya hai
    if (email) doctorData.email = email;
    if (registrationNumber) doctorData.registrationNumber = registrationNumber;

    const doctor = await Doctor.create(doctorData);

    return res.status(201).json({
      success: true,
      message: "Doctor added!",
      doctor
    });
  } catch (err) {
    // Duplicate email/registration error
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email ya registration number already exists!" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Doctor update
router.put("/update/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ success: true, message: "Doctor updated!", doctor });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ DELETE — Doctor deactivate
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    return res.json({ success: true, message: "Doctor removed!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;