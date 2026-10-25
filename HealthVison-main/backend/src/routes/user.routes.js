import express from "express";
import { VerifyJWT } from "../middleware/user.middleware.js";
import { getCurrentUser, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current authenticated user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", VerifyJWT, getCurrentUser);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   first:
 *                     type: string
 *                   last:
 *                     type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", VerifyJWT, updateProfile);

export default router;