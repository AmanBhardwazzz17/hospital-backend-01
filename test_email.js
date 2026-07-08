const { Resend } = require('resend');
require('dotenv').config();
const resend = new Resend(process.env.RESEND_API_KEY);
resend.emails.send({
  from: 'HospTrack <onboarding@resend.dev>',
  to: 'amankumarkunwar074@gmail.com',
  subject: 'HospTrack Test Email',
  html: '<h2>HospTrack</h2><p>Test email delivered</p>'
}).then(r => { console.log('Sent!', r); process.exit(); }).catch(e => { console.log('Error:', e); process.exit(); });
