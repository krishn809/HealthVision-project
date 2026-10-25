import express from "express";
import { VerifyJWT } from "../middleware/user.middleware.js";
import { getStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get("/stats", VerifyJWT, getStats);

export default router;
