import mongoose from "mongoose";
const timeslotSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Available", "Booked", "Pending"],
        default: "Available"
    }
}, {
    timestamps: true
})
export const Timeslot = mongoose.model("Timeslot", timeslotSchema);