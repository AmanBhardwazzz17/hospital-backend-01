const cors = require('cors');
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🏥 HospTrack API",
      version: "1.0.0",
      description: "Hospital Tracking System — Emergency, Beds, Doctors, Appointments API",
    },
    servers: [
      { url: "https://hospital-backend-01.onrender.com" },
      { url: "http://localhost:3000" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

// ✅ Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "HospTrack API Docs",
  customCss: '.swagger-ui .topbar { background: #C0392B; }',
}));

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// ✅ io globally available — routes mein use kar sakte hain
app.set('io', io);

// ✅ Routes import
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require('./routes/appointmentRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const emergencyRoutes = require("./routes/emergencyRoutes");
const smsRoutes = require('./routes/smsRoutes');
const doctorRoutes = require("./routes/doctorRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bloodRoutes = require("./routes/bloodRoutes");

// ✅ Basic routes
app.get("/", (req, res) => {
  res.send(`
    <h2>🏥 HospTrack API is running ✅</h2>
    <p><a href="/api-docs">📖 API Documentation (Swagger)</a></p>
    <p>Backend: hospital-backend-01.onrender.com</p>
  `);
});
// ✅ Health check — real system status
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "Connected" : dbState === 2 ? "Connecting" : "Disconnected";

  res.json({
    success: true,
    backend: "Live",
    database: dbStatus,
    socketio: io ? "Active" : "Inactive",
    timestamp: new Date().toISOString()
  });
});
// ✅ Use routes
app.use("/api/auth", authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blood', bloodRoutes);

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

// ✅ Server start — server.listen (Socket.IO ke liye)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.IO ready!`);
  console.log(`✅ Swagger docs: http://localhost:${PORT}/api-docs`);
});