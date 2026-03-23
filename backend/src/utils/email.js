const nodemailer = require('nodemailer');

const sendOTP = async (email, otp, type) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let subject = '';
    let html = '';

    if (type === 'signup') {
      subject = 'Verify Your StudySpark Account';
      html = `
        <div style="font-family: Arial, sans-serif; max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 style="color: #f97316;">Welcome to StudySpark!</h2>
          <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account.</p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; text-align: center; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `;
    } else if (type === 'forgot_password') {
      subject = 'Reset Your StudySpark Password';
      html = `
        <div style="font-family: Arial, sans-serif; max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 style="color: #f97316;">Password Reset Request</h2>
          <p>We received a request to reset your password. Use the following OPT to securely reset it.</p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; text-align: center; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request a password reset, your account is safe and you can ignore this email.</p>
        </div>
      `;
    }

    const mailOptions = {
      from: `"StudySpark" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};

module.exports = { sendOTP };
