import express from "express";
import { getAllDoctors, getDoctorById, getDoctorProfile, updateDoctorProfile, getPendingDoctors, approveDoctor, adminCreateDoctor } from "../controllers/doctor.controller.js";
import { VerifyJWT } from "../middleware/user.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get a list of all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors retrieved successfully
 */
router.get("/", getAllDoctors);

/**
 * @swagger
 * /doctors/me:
 *   get:
 *     summary: Get doctor profile (for authenticated doctor)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", VerifyJWT, getDoctorProfile);

/**
 * @swagger
 * /doctors/me:
 *   put:
 *     summary: Update doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: number
 *               consultationFee:
 *                 type: number
 *               about:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put("/me", VerifyJWT, updateDoctorProfile);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get a specific doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 */
router.get("/:id", getDoctorById);

// Admin Routes
router.get("/admin/pending", VerifyJWT, authorize('admin'), getPendingDoctors);
router.put("/admin/approve/:id", VerifyJWT, authorize('admin'), approveDoctor);
router.post("/admin/create", VerifyJWT, authorize('admin'), adminCreateDoctor);

export default router;
