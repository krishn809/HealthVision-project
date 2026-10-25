import express from "express";
import { VerifyJWT } from "../middleware/user.middleware.js";
import {
    sendOffer,
    getOffer,
    sendAnswer,
    getAnswer,
    sendIceCandidate,
    getIceCandidates,
    clearSignalingData,
    getConsultationHistory,
    getRoomStatus
} from "../controllers/webrtc.controller.js";

const router = express.Router();

// Sending endpoints (requires targetUserId in body)
/**
 * @swagger
 * /webrtc/offer:
 *   post:
 *     summary: Send a WebRTC offer
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - offer
 *             properties:
 *               targetUserId:
 *                 type: string
 *               offer:
 *                 type: object
 *     responses:
 *       200:
 *         description: Offer sent
 */
router.post("/offer", VerifyJWT, sendOffer);

/**
 * @swagger
 * /webrtc/answer:
 *   post:
 *     summary: Send a WebRTC answer
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - answer
 *             properties:
 *               targetUserId:
 *                 type: string
 *               answer:
 *                 type: object
 *     responses:
 *       200:
 *         description: Answer sent
 */
router.post("/answer", VerifyJWT, sendAnswer);

/**
 * @swagger
 * /webrtc/candidate:
 *   post:
 *     summary: Send an ICE candidate
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - candidate
 *             properties:
 *               targetUserId:
 *                 type: string
 *               candidate:
 *                 type: object
 *     responses:
 *       200:
 *         description: ICE candidate sent
 */
router.post("/candidate", VerifyJWT, sendIceCandidate);

/**
 * @swagger
 * /webrtc/offer:
 *   get:
 *     summary: Get pending WebRTC offer
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WebRTC offer
 */
router.get("/offer", VerifyJWT, getOffer);

/**
 * @swagger
 * /webrtc/answer:
 *   get:
 *     summary: Get pending WebRTC answer
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WebRTC answer
 */
router.get("/answer", VerifyJWT, getAnswer);

/**
 * @swagger
 * /webrtc/candidate:
 *   get:
 *     summary: Get pending ICE candidates
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ICE candidates
 */
router.get("/candidate", VerifyJWT, getIceCandidates);

/**
 * @swagger
 * /webrtc/history:
 *   get:
 *     summary: Get consultation history
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consultation history
 */
router.get("/history", VerifyJWT, getConsultationHistory);

/**
 * @swagger
 * /webrtc/status/{roomId}:
 *   get:
 *     summary: Get room status
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room status
 */
router.get("/status/:roomId", VerifyJWT, getRoomStatus);

/**
 * @swagger
 * /webrtc/clear:
 *   delete:
 *     summary: Clear signaling data for current user
 *     tags: [WebRTC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Signaling data cleared
 */
router.delete("/clear", VerifyJWT, clearSignalingData);

export default router;
