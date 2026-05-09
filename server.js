const cors = require('cors');
const express = require("express");
const http = require("http");           // ✅ ADD
const { Server } = require("socket.io"); // ✅ ADD
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);  // ✅ CHANGE

app.use(express.json());
app.use(cors());

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// ✅ Socket.io connection
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// ✅ io globally available karo (routes mein use hoga)
app.set('io', io);

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

// ✅ server.listen (app.listen nahi!)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.io ready!`);
});