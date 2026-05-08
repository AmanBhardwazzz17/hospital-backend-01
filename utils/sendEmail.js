const https = require("https");

const sendVerificationEmail = async (email, token) => {
  return new Promise((resolve, reject) => {
    const link = `https://hospital-backend-01.onrender.com/api/auth/verify/${token}`;

    const body = JSON.stringify({
      from: "HospTrack <onboarding@resend.dev>",
      to: [email],
      subject: "✅ Verify your HospTrack account",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;">
          <h2 style="color:#C0392B;">🏥 HospTrack</h2>
          <h3>Verify your email</h3>
          <p>Click below to verify your account:</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#C0392B;color:white;border-radius:8px;text-decoration:none;font-weight:700;">
            ✅ Verify Email
          </a>
          <p style="margin-top:16px;color:#999;font-size:12px;">Link 24 hours mein expire ho jayega.</p>
        </div>
      `,
    });

    const options = {
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log("✅ Verification email sent to:", email);
          resolve(true);
        } else {
          console.error("❌ Email send error:", data);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      console.error("❌ Email send error:", err.message);
      resolve(false);
    });

    req.write(body);
    req.end();
  });
};

module.exports = sendVerificationEmail;