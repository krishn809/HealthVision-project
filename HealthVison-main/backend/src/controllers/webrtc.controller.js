import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Consultation } from "../models/consultation.model.js";
import { Appointment } from "../models/appointment.models.js";

// Dummy in-memory store for 1-to-1 signaling data
const signalingStore = new Map();

const getUserData = (userId) => {
    if (!signalingStore.has(userId)) {
        signalingStore.set(userId, {
            offer: null,
            answer: null,
            candidates: []
        });
    }
    return signalingStore.get(userId);
};

export const sendOffer = async (req, res, next) => {
    try {
        const { targetUserId, offer } = req.body;
        const senderId = req.user.id;

        if (!targetUserId || !offer) {
            return next(new ApiError(400, "targetUserId and offer are required"));
        }

        const targetData = getUserData(targetUserId);
        targetData.offer = { ...offer, from: senderId };

        res.status(200).json(new ApiResponse(200, {}, "Offer sent successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to send offer"));
    }
};

export const getOffer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const myData = getUserData(userId);

        res.status(200).json(new ApiResponse(200, { offer: myData.offer }, "Offer retrieved successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to get offer"));
    }
};

export const sendAnswer = async (req, res, next) => {
    try {
        const { targetUserId, answer } = req.body;
        const senderId = req.user.id;

        if (!targetUserId || !answer) {
            return next(new ApiError(400, "targetUserId and answer are required"));
        }

        const targetData = getUserData(targetUserId);
        targetData.answer = { ...answer, from: senderId };

        res.status(200).json(new ApiResponse(200, {}, "Answer sent successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to send answer"));
    }
};

export const getAnswer = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const myData = getUserData(userId);

        res.status(200).json(new ApiResponse(200, { answer: myData.answer }, "Answer retrieved successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to get answer"));
    }
};

export const sendIceCandidate = async (req, res, next) => {
    try {
        const { targetUserId, candidate } = req.body;
        const senderId = req.user.id;

        if (!targetUserId || !candidate) {
            return next(new ApiError(400, "targetUserId and candidate are required"));
        }

        const targetData = getUserData(targetUserId);
        targetData.candidates.push({ candidate, from: senderId });

        res.status(200).json(new ApiResponse(200, {}, "ICE Candidate sent successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to send ICE candidate"));
    }
};

export const getIceCandidates = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const myData = getUserData(userId);

        res.status(200).json(new ApiResponse(200, { candidates: myData.candidates }, "ICE Candidates retrieved successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to get ICE candidates"));
    }
};

export const clearSignalingData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        signalingStore.delete(userId);
        res.status(200).json(new ApiResponse(200, {}, "Signaling data cleared successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to clear signaling data"));
    }
};

export const getConsultationHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Find appointments for the user
        const appointments = await Appointment.find({ userId });
        const appointmentIds = appointments.map(a => a._id);

        const history = await Consultation.find({
            appointmentId: { $in: appointmentIds }
        }).populate("appointmentId");

        res.status(200).json(new ApiResponse(200, history, "Consultation history retrieved successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to get consultation history"));
    }
};

export const getRoomStatus = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const consultation = await Consultation.findOne({ roomId });

        if (!consultation) {
            return next(new ApiError(404, "Room not found"));
        }

        res.status(200).json(new ApiResponse(200, consultation, "Room status retrieved successfully"));
    } catch (error) {
        next(new ApiError(500, "Failed to get room status"));
    }
};
