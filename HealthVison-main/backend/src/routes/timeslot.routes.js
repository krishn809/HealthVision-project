import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createTimeslot, getTimeslots } from "../controllers/timeslot.controller.js";

const router = express.Router();

// Create a timeslot (Protected)
/**
 * @swagger
 * /timeslots/{doctorId}:
 *   post:
 *     summary: Create new timeslots
 *     tags: [Timeslots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - slots
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               slots:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Timeslots created successfully
 */
router.post("/:doctorId", protect, createTimeslot);

/**
 * @swagger
 * /timeslots/{doctorId}:
 *   get:
 *     summary: Get timeslots for a doctor
 *     tags: [Timeslots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Timeslots retrieved successfully
 */
router.get("/:doctorId", protect, getTimeslots);

export default router;