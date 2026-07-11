const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ PUT — Hospital apna blood stock update kare
router.put("/update/:hospitalId", verifyToken, async (req, res) => {
  try {
    const { bloodBank } = req.body;
    if (!bloodBank) {
      return res.status(400).json({ message: "bloodBank data required" });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.hospitalId,
      { bloodBank },
      { new: true }
    );

    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    return res.json({ success: true, message: "Blood stock updated!", bloodBank: hospital.bloodBank });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Public: kisi bhi blood group ki availability search karo (sabhi approved hospitals mein)
router.get("/search", async (req, res) => {
  try {
    const { group, city } = req.query;
    if (!group) return res.status(400).json({ message: "Blood group required" });

    const query = {
      isActive: true,
      approvalStatus: "approved",
      [`bloodBank.${group}`]: { $gt: 0 }
    };
    if (city) query.city = new RegExp(city, "i");

    const hospitals = await Hospital.find(query)
      .select("name city address phone latitude longitude bloodBank")
      .sort({ [`bloodBank.${group}`]: -1 });

    return res.json({ success: true, group, total: hospitals.length, hospitals });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Ek hospital ka pura blood bank stock dekho (public)
router.get("/hospital/:hospitalId", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId).select("name bloodBank");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    return res.json({ success: true, hospital });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
