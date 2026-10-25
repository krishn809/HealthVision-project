import express from 'express';
import {
    uploadReport,
    getUserReports,
    getReportById,
    deleteReport,
    analyzeReport
} from '../controllers/report.controller.js';
import { VerifyJWT } from '../middleware/user.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /reports/upload:
 *   post:
 *     summary: Upload a medical report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Report uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', VerifyJWT, upload.single('file'), uploadReport);
/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports for authenticated user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', VerifyJWT, getUserReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get a specific report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', VerifyJWT, getReportById);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', VerifyJWT, deleteReport);

/**
 * @swagger
 * /reports/analyze:
 *   post:
 *     summary: Analyze a medical report using ML API
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportId
 *             properties:
 *               reportId:
 *                 type: string
 *                 description: ID of the report to analyze
 *     responses:
 *       200:
 *         description: Report analyzed successfully
 *       400:
 *         description: Report ID is required
 *       404:
 *         description: Report not found
 *       503:
 *         description: ML API unavailable
 *       401:
 *         description: Unauthorized
 */
router.post('/analyze', VerifyJWT, analyzeReport);

export default router;
