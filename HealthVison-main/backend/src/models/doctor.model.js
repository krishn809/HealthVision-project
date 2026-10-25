import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        specialization: {
            type: String,
            required: false,
            trim: true,
        },
        experience: {
            type: Number,
            required: false,
            min: 0,
        },
        rating: {
            type: Number,
            default: 4.5,
            min: 0,
            max: 5,
        },
        availability: {
            type: [String],
            default: [],
        },
        about: {
            type: String,
            required: false,
            trim: true,
        },
        qualifications: {
            type: String, // e.g., "MBBS, MD"
            required: false,
            trim: true,
        },
        location: {
            type: String,
            required: false,
            trim: true,
        },
        languages: {
            type: [String],
            default: ["English", "Hindi"],
        },
        registration: {
            type: String,
            required: false,
            trim: true,
        },
        contact: {
            type: String, // Store phone number as string
            required: false,
            trim: true,
        },
        fee: {
            type: Number,
            required: false,
            min: 0,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false // Optional for compatibility with existing data
        },
        avatarUrl: {
            type: String,
            required: false,
        },
        isApproved: {
            type: Boolean,
            default: false,
            index: true
        },
        isReal: {
            type: Boolean,
            default: false,
            // false = demo(test) doctor
            // true = real verified doctor
            index: true
        },
    },
    {
        timestamps: true,
    }
);

// Add indexes for optimization
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ location: 1 });
doctorSchema.index({ userId: 1 });

export const Doctor = mongoose.model("Doctor", doctorSchema);
