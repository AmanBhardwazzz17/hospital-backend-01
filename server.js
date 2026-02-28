// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Import routes (file: routes/authRoutes.js)
const authRoutes = require("./routes/authRoutes");

// ✅ Basic route (test)
app.get("/", (req, res) => {
  res.send("Hospital Backend API is running ✅");
});

// ✅ Use routes
app.use("/api/auth", authRoutes);

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});