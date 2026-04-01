// backend/src/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendOtp = async (to, otp) => {
  await transporter.sendMail({
    from: `"CivicVote" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your CivicVote verification code',
    text: `Your one-time verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px;">
        <h2 style="font-size:22px;color:#0f0f0e;margin-bottom:8px;">Your verification code</h2>
        <p style="color:#4a4a47;margin-bottom:24px;">Enter this code to complete your CivicVote sign-in.</p>
        <div style="background:#f2f1ed;border-radius:10px;padding:24px;text-align:center;letter-spacing:12px;font-size:32px;font-weight:700;color:#1a3a5c;">${otp}</div>
        <p style="color:#8a8a85;font-size:12px;margin-top:20px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};
