const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, token) => {
  try {
    const verifyUrl = `https://hospital-backend-01.onrender.com/api/auth/verify/${token}`;
    
    await resend.emails.send({
      from: 'HospTrack <onboarding@resend.dev>',
      to: email,
      subject: '✅ Verify Your HospTrack Account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#C0392B,#1A252F);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
            <h1 style="color:white;margin:0;">🏥 HospTrack</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Emergency Hospital Availability System</p>
          </div>
          <h2 style="color:#1A252F;">Verify Your Email</h2>
          <p style="color:#5D6D7E;">Click below to verify your account:</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#C0392B;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
            ✅ Verify My Account
          </a>
          <p style="color:#5D6D7E;font-size:12px;margin-top:24px;">Link expires in 24 hours.</p>
        </div>
      `
    });
    console.log("✅ Email sent to:", email);
  } catch (err) {
    console.log("❌ Email error:", err.message);
  }
};

module.exports = { sendVerificationEmail };