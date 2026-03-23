const express = require("express");
const validateSignUpData = require("../utils/validation");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { sendOTP } = require("../utils/email");

const authRouter = express.Router();

/**
 * SEND SIGNUP OTP
 */
authRouter.post("/send-signup-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear old OTPs
    await OTP.deleteMany({ email: normalizedEmail, type: 'signup' });
    
    // Save new OTP
    await OTP.create({
      email: normalizedEmail,
      otp,
      type: 'signup'
    });

    const isSent = await sendOTP(normalizedEmail, otp, 'signup');
    if (!isSent) {
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * SIGNUP
 */
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, email, password, otp } = req.body;
    const normalizedEmail = email.toLowerCase();

    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email: normalizedEmail, type: 'signup' });
    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or missing. Please request a new one." });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: passwordHash,
    });
    
    // OTP correctly verified, delete it
    await OTP.deleteMany({ email: normalizedEmail, type: 'signup' });

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

/**
 * SEND FORGOT PASSWORD OTP
 */
authRouter.post("/send-forgot-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      return res.status(404).json({ error: "Account not found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.deleteMany({ email: normalizedEmail, type: 'forgot_password' });
    await OTP.create({
      email: normalizedEmail,
      otp,
      type: 'forgot_password'
    });

    const isSent = await sendOTP(normalizedEmail, otp, 'forgot_password');
    if (!isSent) {
      return res.status(500).json({ error: "Failed to send reset email" });
    }

    res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * RESET PASSWORD
 */
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase();
    const otpRecord = await OTP.findOne({ email: normalizedEmail, type: 'forgot_password' });
    
    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or missing. Please request a new one." });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();

    await OTP.deleteMany({ email: normalizedEmail, type: 'forgot_password' });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * LOGIN
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.validatePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      // sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        targetExams: user.targetExams,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
    });
  }
});
/**
 * LOGOUT
 */
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = authRouter;
