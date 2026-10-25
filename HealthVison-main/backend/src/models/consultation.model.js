import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
        },
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
        startTime: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["active", "completed", "missed"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

// Index for performance
consultationSchema.index({ appointmentId: 1 });

export const Consultation = mongoose.model("Consultation", consultationSchema);
