const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Hospital = require("../models/Hospital");
const Appointment = require("../models/Appointment");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ POST — Patient review submit kare
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { hospitalId, appointmentId, rating, comment } = req.body;

    if (!hospitalId || !rating) {
      return res.status(400).json({ message: "Hospital aur rating required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating 1 se 5 ke beech honi chahiye" });
    }

    // Agar appointmentId diya hai, ek hi appointment pe ek hi review allow karo
    if (appointmentId) {
      const existing = await Review.findOne({ appointmentId, patientId: req.user.id });
      if (existing) {
        return res.status(409).json({ message: "Is appointment ke liye already review de chuke ho" });
      }
    }

    const review = await Review.create({
      patientId: req.user.id,
      patientName: req.body.patientName || "Patient",
      hospitalId,
      appointmentId: appointmentId || null,
      rating,
      comment: comment || "",
    });

    return res.status(201).json({ success: true, message: "Review submit ho gaya!", review });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Hospital ke saare reviews + average rating (public)
router.get("/hospital/:hospitalId", async (req, res) => {
  try {
    const reviews = await Review.find({ hospitalId: req.params.hospitalId })
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : 0;

    return res.json({ success: true, total, avgRating, reviews });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET — Patient ke apne diye hue reviews
router.get("/my", verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ patientId: req.user.id })
      .populate("hospitalId", "name city")
      .sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
