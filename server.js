const cors = require('cors');
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require('./routes/appointmentRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const emergencyRoutes = require("./routes/emergencyRoutes");
const smsRoutes = require('./routes/smsRoutes');

// ✅ Basic route
app.get("/", (req, res) => {
  res.send("Hospital Backend API is running ✅");
});

app.get('/map', (req, res) => {
  res.sendFile(__dirname + '/map.html');
});

// ✅ Use routes
app.use("/api/auth", authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/sms', smsRoutes);

// ✅ MongoDB connect
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.log("❌ MONGO_URI missing in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});