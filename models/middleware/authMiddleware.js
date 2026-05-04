const jwt = require("jsonwebtoken");

// ✅ Token verify karo
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Sirf Admin access
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// ✅ Sirf Hospital access
const hospitalOnly = (req, res, next) => {
  if (req.user.role !== "hospital") {
    return res.status(403).json({ message: "Hospital access required" });
  }
  next();
};

// ✅ Admin ya Hospital access
const adminOrHospital = (req, res, next) => {
  if (!["admin", "hospital"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin or Hospital access required" });
  }
  next();
};

// ✅ Sirf Patient access
const patientOnly = (req, res, next) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Patient access required" });
  }
  next();
};

module.exports = { verifyToken, adminOnly, hospitalOnly, adminOrHospital, patientOnly };