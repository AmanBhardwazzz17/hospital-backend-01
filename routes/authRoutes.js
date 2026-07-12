const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/sendEmail");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

// ✅ reCAPTCHA verify
async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
        },
      }
    );
    const { success, score } = response.data;
    return success && score >= 0.5;
  } catch (err) {
    return false;
  }
}

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, recaptchaToken } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (recaptchaToken) {
      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return res.status(403).json({ message: "reCAPTCHA verification failed!" });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ⛔ EMAIL VERIFICATION TEMPORARILY DISABLED (no budget for email service)
    // const verifyToken = crypto.randomBytes(32).toString("hex");
    // const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient",
      isVerified: true, // ✅ Directly verified — email step skip
      // verifyToken,
      // verifyTokenExpiry,
    });

    // await sendVerificationEmail(email, verifyToken); // ⛔ disabled

    return res.status(201).json({
      success: true,
      message: "Registered successfully! You can login now.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ EMAIL VERIFY (route kept as-is, unused for now)
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verifyToken: req.params.token,
      verifyTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).send(`
        <div style="font-family:sans-serif;text-align:center;padding:48px;">
          <h2 style="color:#C0392B;">❌ Link expired ya invalid hai!</h2>
          <p>Please register again.</p>
          <a href="https://amanbhardwazzz17.github.io/hospital-backend-01/index.html"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#C0392B;color:white;border-radius:8px;text-decoration:none;font-weight:700;">
            Register Karo →
          </a>
        </div>`);
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return res.send(`
      <div style="font-family:sans-serif;text-align:center;padding:48px;">
        <h2 style="color:#1E8449;">✅ Email Verified!</h2>
        <p>Tumhara HospTrack account active ho gaya!</p>
        <a href="https://amanbhardwazzz17.github.io/hospital-backend-01/index.html"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#C0392B;color:white;border-radius:8px;text-decoration:none;font-weight:700;">
          Login Karo →
        </a>
      </div>`);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (recaptchaToken) {
      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return res.status(403).json({ message: "reCAPTCHA verification failed!" });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Account active check
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    // ⛔ Email verification check DISABLED (no budget for email service)
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message: "Email verified nahi hai. Apna inbox check karo."
    //   });
    // }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ ADMIN CREATE — sirf existing admin new admin/hospital bana sakta hai
router.post("/create-user", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create users" });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["admin", "hospital", "patient"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Admin ke banaye users directly verified honge
    });

    return res.status(201).json({
      message: `${role} created successfully`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Hospital user ko hospitalId link karo
router.put("/link-hospital", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    if (decoded.role !== "admin") return res.status(403).json({ message: "Admin only" });

    const { userId, hospitalId } = req.body;
    if (!userId || !hospitalId) return res.status(400).json({ message: "userId and hospitalId required" });

    const user = await User.findByIdAndUpdate(
      userId,
      { hospitalId },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ success: true, message: "Hospital linked!", user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
// ✅ POST — Google Login (Firebase se aane wale users ke liye backend JWT banao)
router.post("/google-login", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: "Email aur name required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Naya user banao — random password (Google users ye use nahi karenge)
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "patient",
        isVerified: true,
        isActive: true
      });
    }

    // Backend ka apna JWT banao
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
// ✅ GET — Apni profile dekho
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Profile update karo
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, address, age, gender, bloodGroup, profilePhoto } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, age, gender, bloodGroup, profilePhoto },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json({ success: true, message: "Profile updated!", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ PUT — Password change karo
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old aur new password required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password kam se kam 6 characters ka ho" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Purana password galat hai" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: "Password successfully changed" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
// ✅ GET — Admin: Saare users dekho
router.get("/users", verifyToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json({ success: true, total: users.length, users });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = router;
