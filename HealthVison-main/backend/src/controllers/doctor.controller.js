import { Doctor } from "../models/doctor.model.js";

export const getAllDoctors = async (req, res, next) => {
    try {
        // Only fetch approved doctors for public list
        const doctors = await Doctor.find({ isApproved: true }).populate('userId', 'avatarUrl');
        // Merge user's avatarUrl into each doctor object
        const data = doctors.map(doc => {
            const d = doc.toObject();
            d.avatarUrl = d.userId?.avatarUrl || d.avatarUrl || null;
            return d;
        });
        res.status(200).json({
            success: true,
            count: data.length,
            data,
        });
    } catch (error) {
        next(error);
    }
};

// --- Admin Controllers ---

export const getPendingDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find({ isApproved: { $ne: true } }).populate('userId', 'name email phone avatarUrl');
        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors,
        });
    } catch (error) {
        next(error);
    }
};

export const approveDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Doctor approved successfully",
            data: doctor,
        });
    } catch (error) {
        next(error);
    }
};

export const adminCreateDoctor = async (req, res, next) => {
    try {
        const { userData, doctorData } = req.body;
        
        // 1. Check if user already exists
        const { User } = await import("../models/user.model.js");
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        // 2. Create User
        const user = await User.create({
            ...userData,
            role: 'doctor',
            isVerified: true // Admin created doctors are auto-verified
        });

        // 3. Create Doctor Profile (Auto-approved)
        const doctor = await Doctor.create({
            ...doctorData,
            userId: user._id,
            name: `${user.name.first} ${user.name.last || ''}`.trim(),
            isApproved: true
        });

        res.status(201).json({
            success: true,
            message: "Doctor created and approved by admin",
            data: { user, doctor }
        });
    } catch (error) {
        next(error);
    }
};

export const getDoctorById = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId', 'avatarUrl');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        const d = doctor.toObject();
        d.avatarUrl = d.userId?.avatarUrl || d.avatarUrl || null;

        res.status(200).json({
            success: true,
            data: d,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }
        next(error);
    }
};

export const getDoctorProfile = async (req, res, next) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found",
            });
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        next(error);
    }
};

export const updateDoctorProfile = async (req, res, next) => {
    try {
        let doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            // Create if it doesn't exist for some reason
            doctor = await Doctor.create({
                userId: req.user._id,
                name: `${req.user.name.first} ${req.user.name.last || ''}`.trim(),
                ...req.body
            });
        } else {
            doctor = await Doctor.findOneAndUpdate(
                { userId: req.user._id },
                req.body,
                {
                    new: true,
                    runValidators: true,
                }
            );
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        next(error);
    }
};
