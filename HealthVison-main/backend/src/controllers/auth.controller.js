import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import imagekit from "../utils/imagekit.js";

export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      height,
      weight,
      allergies,
      medicalHistory,
      currentMedications,
      emergencyContact,
      insurance,
      avatarUrl
    } = req.body;

    // Validation is now handled by middleware

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ message: "User already exists." });
    }
    let uploadedAvatarUrl = null;
    if (avatarUrl) {
      const uploadImage = await imagekit.files.upload({
        file: avatarUrl,
        fileName: `${name.first}_avatar.jpg`,
        folder: "/avatars"
      });
      uploadedAvatarUrl = uploadImage.url;
    }
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      height,
      weight,
      allergies,
      medicalHistory,
      currentMedications,
      emergencyContact,
      insurance,
      avatarUrl: uploadedAvatarUrl
    });

    // Send email OTP for verification
    const otp = user.generateEmailOtp();
    await user.save({ validateBeforeSave: false });
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your HealthVision email',
        message: `Your email verification OTP is: ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:#2563eb">Verify your email</h2>
            <p>Welcome to HealthVision! Use the OTP below to verify your email address.</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1d4ed8;text-align:center;padding:16px 0">${otp}</div>
            <p style="color:#6b7280;font-size:13px">This OTP expires in <strong>10 minutes</strong>. If you didn't sign up, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send verification OTP:', emailErr);
      // Don't block registration if email fails
    }

    if (role === 'doctor') {
      const { Doctor } = await import("../models/doctor.model.js");
      await Doctor.create({
        userId: user._id,
        name: `${name.first} ${name.last || ''}`.trim(),
        avatarUrl: uploadedAvatarUrl
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully.",
      requiresVerification: true,
      token,
      user: {
        id: user._id,
        isApproved: role === 'doctor' ? false : true,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        location: user.location,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight,
        allergies: user.allergies,
        medicalHistory: user.medicalHistory,
        currentMedications: user.currentMedications,
        emergencyContact: user.emergencyContact,
        insurance: user.insurance,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendVerificationOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' });

    const otp = user.generateEmailOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: 'Verify your HealthVision email',
      message: `Your email verification OTP is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#2563eb">Verify your email</h2>
          <p>Use the OTP below to verify your HealthVision email address.</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1d4ed8;text-align:center;padding:16px 0">${otp}</div>
          <p style="color:#6b7280;font-size:13px">This OTP expires in <strong>10 minutes</strong>.</p>
        </div>
      `
    });

    return res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      _id: req.user.id,
      emailOtp: hashedOtp,
      emailOtpExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation handled by middleware

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    let doctorProfile = null;
    if (user.role === 'doctor') {
      const { Doctor } = await import("../models/doctor.model.js");
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    return res.status(200).json({
      message: "User logged in successfully.",
      token,
      user: {
        id: user._id,
        doctorId: doctorProfile?._id,
        isApproved: user.role === 'doctor' ? doctorProfile?.isApproved : true,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        location: user.location,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight,
        allergies: user.allergies,
        medicalHistory: user.medicalHistory,
        currentMedications: user.currentMedications,
        emergencyContact: user.emergencyContact,
        insurance: user.insurance,
        avatarUrl: user.avatarUrl
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
        html
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};