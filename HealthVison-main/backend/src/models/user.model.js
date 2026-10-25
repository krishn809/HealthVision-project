import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
      trim: true
    },
    last: {
      type: String,
      trim: true
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient"
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: false
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: String,
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: false
  },
  height: {
    type: Number,
    required: false
  },
  weight: {
    type: Number,
    required: false
  },
  allergies: [{
    type: String
  }],
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    notes: String
  }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  avatarUrl: {
    type: String,
    required: false,
  },
  hospitalDetails: {
    patientId: {
      type: String,
      unique: true,
      sparse: true
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    dischargeDate: Date,
    roomNumber: String,
    doctorAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["Admitted", "Discharged", "Outpatient", "Emergency"],
      default: "Admitted"
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    relation: {
      type: String,
      required: false
    }
  },
  insurance: {
    provider: String,
    policyNumber: String,
    validTill: Date
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailOtp: String,
  emailOtpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Add indexes for optimization
userSchema.index({ role: 1 });
userSchema.index({ phone: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (e.g., 10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateEmailOtp = function () {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash and store it
  this.emailOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Valid for 10 minutes
  this.emailOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

export const User = mongoose.model("User", userSchema);
