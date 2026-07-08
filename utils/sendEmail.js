const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "amankumarkunwar074@gmail.com";

// ✅ Email Verification
const sendVerificationEmail = async (email, token) => {
  try {
    const link = `https://hospital-backend-01.onrender.com/api/auth/verify/${token}`;
    await resend.emails.send({
      from: "HospTrack <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: "Verify HospTrack Account",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#C0392B,#1A252F);padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h2 style="color:white;margin:0;">🏥 HospTrack</h2>
            <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;">Emergency Hospital Availability System</p>
          </div>
          <h3 style="color:#1A252F;">Email Verify Karo</h3>
          <p style="color:#555;">Neeche button click karo account verify karne ke liye:</p>
          <a href="${link}" style="display:inline-block;padding:12px 28px;background:#C0392B;color:white;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
            ✅ Verify Email
          </a>
          <p style="color:#999;font-size:12px;margin-top:16px;">Link 24 hours mein expire ho jayega.</p>
        </div>
      `,
    });
    console.log("✅ Verification email sent");
    return true;
  } catch (err) {
    console.error("❌ Email error:", err.message);
    return false;
  }
};

// ✅ Hospital Approval Email
const sendHospitalApprovalEmail = async (hospitalName, email, password) => {
  try {
    await resend.emails.send({
      from: "HospTrack <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `Hospital Approved - ${hospitalName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#C0392B,#1A252F);padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h2 style="color:white;margin:0;">🏥 HospTrack</h2>
            <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;">Emergency Hospital Availability System</p>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="color:#166534;margin:0 0 8px;">✅ Hospital Approved!</h3>
            <p style="color:#166534;margin:0;font-size:14px;">${hospitalName} ab HospTrack pe live hai!</p>
          </div>
          <h3 style="color:#1A252F;">Login Credentials</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #eee;font-weight:700;width:30%;">Email</td>
              <td style="padding:10px;border:1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #eee;font-weight:700;">Password</td>
              <td style="padding:10px;border:1px solid #eee;">${password}</td>
            </tr>
          </table>
          <a href="https://amanbhardwazzz17.github.io/hospital-backend-01/" style="display:inline-block;padding:12px 28px;background:#C0392B;color:white;border-radius:8px;text-decoration:none;font-weight:700;margin:20px 0;">
            🏥 Login to Dashboard
          </a>
          <p style="color:#999;font-size:12px;">HospTrack - Emergency Hospital Availability System</p>
        </div>
      `,
    });
    console.log("✅ Approval email sent for:", hospitalName);
    return true;
  } catch (err) {
    console.error("❌ Approval email error:", err.message);
    return false;
  }
};

// ✅ Appointment Confirmation Email
const sendAppointmentEmail = async (patientName, doctorName, date, time, hospitalName) => {
  try {
    await resend.emails.send({
      from: "HospTrack <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `Appointment Confirmed - ${patientName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#C0392B,#1A252F);padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h2 style="color:white;margin:0;">🏥 HospTrack</h2>
          </div>
          <h3 style="color:#1A252F;">📅 Appointment Confirmed!</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #eee;font-weight:700;">Patient</td>
              <td style="padding:10px;border:1px solid #eee;">${patientName}</td>
            </tr>
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #eee;font-weight:700;">Doctor</td>
              <td style="padding:10px;border:1px solid #eee;">${doctorName}</td>
            </tr>
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #eee;font-weight:700;">Hospital</td>
              <td style="padding:10px;border:1px solid #eee;">${hospitalName}</td>
            </tr>
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #eee;font-weight:700;">Date</td>
              <td style="padding:10px;border:1px solid #eee;">${date}</td>
            </tr>
            <tr>
              <td style="padding:10px;background:#f9fafb;border:1px solid #eee;font-weight:700;">Time</td>
              <td style="padding:10px;border:1px solid #eee;">${time}</td>
            </tr>
          </table>
          <p style="color:#999;font-size:12px;margin-top:20px;">HospTrack - Emergency Hospital Availability System</p>
        </div>
      `,
    });
    console.log("✅ Appointment email sent for:", patientName);
    return true;
  } catch (err) {
    console.error("❌ Appointment email error:", err.message);
    return false;
  }
};

module.exports = { sendVerificationEmail, sendHospitalApprovalEmail, sendAppointmentEmail };