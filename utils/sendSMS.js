const axios = require("axios");

const FAST2SMS_KEY = process.env.FAST2SMS_KEY;

// ✅ Single SMS bhejo
const sendSMS = async (phone, message) => {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: phone,
      },
      {
        headers: {
          authorization: FAST2SMS_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ SMS sent to:", phone, response.data);
    return { success: true, data: response.data };
  } catch (err) {
    console.log("❌ SMS error:", err.message);
    return { success: false, error: err.message };
  }
};

// ✅ Emergency Alert SMS
const sendEmergencyAlert = async (phone, patientName, emergencyType, hospitalName) => {
  const message = `🚨 EMERGENCY ALERT - HospTrack
Patient: ${patientName}
Emergency: ${emergencyType}
Hospital: ${hospitalName}
Please be prepared for arrival.
Helpline: 112 | Ambulance: 108`;
  return await sendSMS(phone, message);
};

// ✅ Bed Critical Alert SMS
const sendBedCriticalAlert = async (phone, hospitalName, bedType, available) => {
  const message = `⚠️ BED ALERT - HospTrack
Hospital: ${hospitalName}
Bed Type: ${bedType}
Available: ${available} beds remaining
Please update availability immediately.
HospTrack System`;
  return await sendSMS(phone, message);
};

// ✅ Appointment Reminder SMS
const sendAppointmentReminder = async (phone, patientName, doctorName, date, time) => {
  const message = `📅 APPOINTMENT REMINDER - HospTrack
Patient: ${patientName}
Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Please arrive 15 mins early.
HospTrack System`;
  return await sendSMS(phone, message);
};

// ✅ OTP SMS
const sendOTP = async (phone, otp) => {
  const message = `Your HospTrack OTP is: ${otp}
Valid for 10 minutes.
Do not share this OTP with anyone.
HospTrack Security Team`;
  return await sendSMS(phone, message);
};

// ✅ Registration Welcome SMS
const sendWelcomeSMS = async (phone, name) => {
  const message = `🏥 Welcome to HospTrack!
Hello ${name},
Your account has been created successfully.
You can now find nearby hospitals, check bed availability & book appointments.
Stay Safe! - HospTrack Team`;
  return await sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendEmergencyAlert,
  sendBedCriticalAlert,
  sendAppointmentReminder,
  sendOTP,
  sendWelcomeSMS,
};