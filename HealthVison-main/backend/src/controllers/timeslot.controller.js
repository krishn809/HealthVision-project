import { Doctor } from "../models/doctor.model.js";
import { Timeslot } from "../models/timeslot.model.js";
import { isValidObjectId } from "../utils/validation.utils.js";

/**
 * Create a new timeslot for a doctor
 * POST /api/timeslots/:doctorId
 */
export const createTimeslot = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { date, time } = req.body;

        // Validation
        if (!isValidObjectId(doctorId)) {
            return res.status(400).json({ message: "Invalid doctor ID format" });
        }

        if (!date || !time) {
            return res.status(400).json({ message: "Date and time are required" });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Check if timeslot already exists
        const existingSlot = await Timeslot.findOne({ doctorId, date, time });
        if (existingSlot) {
            return res.status(409).json({ message: "Timeslot already exists" });
        }

        const timeslot = await Timeslot.create({
            doctorId,
            date,
            time,
            status: "Available"
        });

        res.status(201).json({
            success: true,
            data: timeslot
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all timeslots for a doctor
 * GET /api/timeslots/:doctorId
 */
export const getTimeslots = async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        if (!isValidObjectId(doctorId)) {
            return res.status(400).json({ message: "Invalid doctor ID format" });
        }

        const timeslots = await Timeslot.find({ doctorId }).sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: timeslots.length,
            data: timeslots
        });
    } catch (error) {
        next(error);
    }
};