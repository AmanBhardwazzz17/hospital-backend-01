# 🏥 Emergency Hospital Availability Monitoring System

A real-time web application that helps patients find available 
hospital beds during emergencies.

## 🔗 Live Demo
- **Frontend:** https://amanbhardwazzz17.github.io/hospital-backend-01/
- **Backend:** https://hospital-backend-01.onrender.com

## 👨‍💻 Built By
**Aman Kumar** | Roll: ua2503cdh782 |  
IIT Patna — Capstone-I Project 2026

## ✨ Features

### Core
- 🛏️ Real-time bed availability (General, ICU, Oxygen, Ventilator)
- 🗺️ Google Maps — nearby hospitals with GPS
- 🚨 Emergency SOS — SMS alert to 3 nearest hospitals
- 📊 Analytics — peak emergency hours charts
- 🔐 Secure login — JWT + bcrypt + Google Login
- 📱 SMS alerts via Fast2SMS
- 📧 Email verification via Resend.com

### Hospital Management
- 🏥 Hospital Registration & Approval — self-serve onboarding with admin approval workflow
- 📅 Appointment Booking — with doctor & time-slot selection
- 📧 Email Notifications — appointment confirmations & hospital approval emails
- 📱 QR Code Check-in — scan-to-verify appointment system for hospital reception

### User Experience
- 🌙 Dark Mode — one-click theme toggle across all dashboards
- 🌐 Multi-language Support — Hindi/English toggle via Google Translate
- ⭐ Hospital Reviews & Ratings — patients rate their visit experience

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, MongoDB Atlas
- **Frontend:** HTML, CSS, JavaScript, Chart.js
- **Security:** JWT, bcrypt, reCAPTCHA v3, Firebase
- **Real-time:** Socket.IO
- **SMS:** Fast2SMS
- **Email:** Resend.com
- **Hosting:** Render + GitHub Pages

## 👥 Login Credentials (Demo)
- **Admin:** admin@hosptrack.com / Admin@123
- **Hospital:** cityhospital@hosptrack.com / Hospital@123

## 📁 Project Structure
hospital-backend-01/
├── middleware/     # Auth middleware
├── models/         # MongoDB schemas
├── routes/         # API endpoints
├── utils/          # Email & SMS helpers
└── *.html          # Frontend dashboards


