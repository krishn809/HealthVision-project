import express from "express";
import { createPayment, verifyPayment, getPaymentHistory, getWalletBalance, walletPayment } from "../controllers/payment.controller.js";
import { VerifyJWT } from "../middleware/user.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: Create a new payment order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment order created
 */
router.post("/create", VerifyJWT, createPayment);

/**
 * @swagger
 * /payment/verify:
 *   post:
 *     summary: Verify a payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post("/verify", VerifyJWT, verifyPayment);

/**
 * @swagger
 * /payment/wallet-payment:
 *   post:
 *     summary: Process payment using wallet balance
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet payment successful
 */
router.post("/wallet-payment", VerifyJWT, walletPayment);

/**
 * @swagger
 * /payment/history:
 *   get:
 *     summary: Get payment history for the current user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history retrieved
 */
router.get("/history", VerifyJWT, getPaymentHistory);

/**
 * @swagger
 * /payment/balance:
 *   get:
 *     summary: Get user's wallet balance
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved
 */
router.get("/balance", VerifyJWT, getWalletBalance);

export default router;