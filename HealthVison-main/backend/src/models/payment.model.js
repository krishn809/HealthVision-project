import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    walletAmount: {
        type: Number,
        default: 0
    },
    razorpayAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    paymentId: {
        type: String,
        required: true
    },
    transactionId: {
        type: String
    }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);