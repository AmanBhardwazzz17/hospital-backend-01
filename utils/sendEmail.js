const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const link = `https://hospital-backend-01.onrender.com/api/auth/verify/${token}`;

    await transporter.sendMail({
      from: `"HospTrack" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Verify your HospTrack account",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
          <h2 style="color:#C0392B;">🏥 HospTrack</h2>
          <h3>Verify your email</h3>
          <p>Click the button below to verify your account:</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#C0392B;color:white;border-radius:8px;text-decoration:none;font-weight:700;">
            ✅ Verify Email
          </a>
          <p style="margin-top:16px;color:#999;font-size:12px;">Link 24 hours mein expire ho jayega.</p>
        </div>
      `,
    });

    console.log("✅ Verification email sent to:", email);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
  }
};

module.exports = sendVerificationEmail;