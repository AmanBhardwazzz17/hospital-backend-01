const express = require('express');
const router = express.Router();

// GET all appointments
router.get('/', (req, res) => {
  res.json({ message: 'Get all appointments' });
});

// POST create appointment
router.post('/', (req, res) => {
  res.json({ message: 'Create appointment' });
});

module.exports = router;