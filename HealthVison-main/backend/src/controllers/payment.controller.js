import razorpay from "../config/razorpay.js";
import { Payment } from "../models/payment.model.js";
import { verifyPaymentSignature } from "../utils/verifySignature.js";
import { User } from "../models/user.model.js";
import { Appointment } from "../models/appointment.models.js";
import { Timeslot } from "../models/timeslot.model.js";
import { Doctor } from "../models/doctor.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import mongoose from "mongoose";

const sendConfirmationEmail = async (appointmentId) => {
    try {
        const appointment = await Appointment.findById(appointmentId)
            .populate("userId")
            .populate("doctorId");

        if (!appointment) return;

        const { userId: user, doctorId: doctor, date, time } = appointment;

        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="background-color: #10b981; padding: 25px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HealthVision</h1>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <span style="background-color: #d1fae5; color: #059669; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Appointment Confirmed</span>
                    </div>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6;">Dear <strong>${user.name.first || user.name}</strong>,</p>
                    <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 20px;">Great news! Your appointment has been successfully scheduled and paid.</p>
                    
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #777777; font-size: 14px; width: 100px;">Doctor</td>
                                <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">Dr. ${doctor.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #777777; font-size: 14px;">Date</td>
                                <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #777777; font-size: 14px;">Time</td>
                                <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${time}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #777777; font-size: 14px;">Location</td>
                                <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${doctor.location}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 14px; color: #777777; text-align: center; margin-top: 30px;">
                        Please arrive 10 minutes before your scheduled time.
                    </p>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="font-size: 12px; color: #999999; margin: 0;">&copy; 2026 HealthVision. All rights reserved.</p>
                </div>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: "Appointment Confirmed - HealthVision",
            message: `Your appointment with Dr. ${doctor.name} on ${new Date(date).toLocaleDateString()} at ${time} is confirmed.`,
            html: emailHtml
        });
        console.log(`Confirmation email sent to ${user.email} for appointment ${appointmentId}`);
    } catch (error) {
        console.error("Confirmation email failed:", error);
    }
};

export const createPayment = async (req, res) => {
    try {
        const { amount, appointmentId, walletAmount = 0 } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (!amount || amount < 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const razorpayAmount = amount - walletAmount;

        if (walletAmount > (user.walletBalance || 0)) {
            return res.status(400).json({ message: "Insufficient wallet balance" });
        }

        if (razorpayAmount < 0) {
            return res.status(400).json({ message: "Wallet deduction cannot exceed total amount" });
        }

        // Hybrid Payment: Create a Razorpay order for the remaining balance after 
        // deducting the selected wallet amount.

        let order = { id: `full_wallet_${Date.now()}`, amount: 0, currency: "INR" };
        if (razorpayAmount > 0) {
            const options = {
                amount: Math.round(razorpayAmount * 100), // amount in smallest currency unit
                currency: "INR",
                receipt: `payment_${Date.now()}`,
                notes: {
                    userId: user._id.toString(),
                    userEmail: user.email,
                    appointmentId: appointment._id.toString(),
                    walletAmount: walletAmount.toString()
                }
            };
            order = await razorpay.orders.create(options);
        }

        await Payment.create({
            userId: user._id,
            appointmentId: appointment._id,
            amount: amount,
            walletAmount: walletAmount,
            razorpayAmount: razorpayAmount,
            status: razorpayAmount > 0 ? "pending" : "completed",
            paymentId: order.id
        });

        // If it's a full wallet payment that somehow reached here:
        if (razorpayAmount === 0) {
            user.walletBalance -= walletAmount;
            await user.save();
            appointment.paymentStatus = "Paid";
            appointment.status = "Scheduled";
            await appointment.save();
            await Timeslot.findOneAndUpdate(
                { doctorId: appointment.doctorId, date: appointment.date, time: appointment.time },
                { status: "Booked" }
            );
            sendConfirmationEmail(appointmentId);
            return res.status(200).json({ message: "Payment successful via wallet", order: null });
        }

        return res.status(200).json({ order });
    } catch (error) {
        console.error("Error creating payment:", error);
        return res.status(error.statusCode || 500).json({
            message: error.error?.description || "Internal server error",
            error: error.error
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        const payment = await Payment.findOneAndUpdate(
            { paymentId: razorpay_order_id },
            {
                status: "completed",
                transactionId: razorpay_payment_id
            },
            { new: true }
        );

        if (payment) {
            // Deduct wallet amount if it was a hybrid payment
            if (payment.walletAmount > 0) {
                const user = await User.findById(payment.userId);
                if (user) {
                    user.walletBalance = (user.walletBalance || 0) - payment.walletAmount;
                    await user.save();
                }
            }

            const appointment = await Appointment.findByIdAndUpdate(payment.appointmentId, { 
                paymentStatus: "Paid",
                status: "Scheduled"
            });
            if (appointment) {
                // Update the Timeslot to Booked
                await Timeslot.findOneAndUpdate(
                    {
                        doctorId: appointment.doctorId,
                        date: appointment.date,
                        time: appointment.time
                    },
                    { status: "Booked" }
                );
            }
            sendConfirmationEmail(payment.appointmentId);
        }

        return res.status(200).json({ message: "Payment verified successfully", payment });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const payments = await Payment.find({ userId })
            .populate({
                path: 'appointmentId',
                populate: {
                    path: 'doctorId',
                    select: 'name specialization'
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ payments });
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getWalletBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("walletBalance");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ balance: user.walletBalance || 0 });
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const walletPayment = async (req, res) => {
    try {
        const { amount, appointmentId } = req.body;
        const userId = req.user._id;

        if (!amount || !appointmentId) {
            return res.status(400).json({ message: "Amount and Appointment ID are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentBalance = user.walletBalance || 0;
        if (currentBalance < amount) {
            return res.status(400).json({ message: "Insufficient wallet balance" });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // 1. Deduct from wallet
        user.walletBalance = currentBalance - amount;
        await user.save();

        // 2. Mark appointment as paid
        appointment.paymentStatus = "Paid";
        appointment.status = "Scheduled"; // Ensure it's marked as scheduled if it was pending
        await appointment.save();

        // 3. Update Timeslot
        await Timeslot.findOneAndUpdate(
            {
                doctorId: appointment.doctorId,
                date: appointment.date,
                time: appointment.time
            },
            { status: "Booked" }
        );

        // 4. Create Payment record
        const walletTransactionId = `wallet_${Date.now()}`;
        await Payment.create({
            userId: user._id,
            appointmentId: appointment._id,
            amount: amount,
            status: "completed",
            paymentId: walletTransactionId,
            transactionId: walletTransactionId
        });

        // Send email (async)
        sendConfirmationEmail(appointmentId);

        return res.status(200).json({ message: "Payment successful using wallet balance" });
    } catch (error) {
        console.error("Wallet Payment Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const webhookController = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.body) // req.body must be the raw body buffer from express.raw()
            .digest("hex");

        if (signature !== expectedSignature) {
            return res.status(400).send("Invalid webhook signature");
        }

        const event = JSON.parse(req.body.toString());

        if (event.event === "payment.captured") {
            const orderId = event.payload.payment.entity.order_id;

            const payment = await Payment.findOneAndUpdate(
                { paymentId: orderId },
                { status: "completed", transactionId: event.payload.payment.entity.id }
            );

            if (payment) {
                const appointment = await Appointment.findByIdAndUpdate(payment.appointmentId, { 
                    paymentStatus: "Paid",
                    status: "Scheduled"
                });
                if (appointment) {
                    // Update the Timeslot to Booked
                    await Timeslot.findOneAndUpdate(
                        {
                            doctorId: appointment.doctorId,
                            date: appointment.date,
                            time: appointment.time
                        },
                        { status: "Booked" }
                    );
                }
                sendConfirmationEmail(payment.appointmentId);
            }
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).send("Webhook processing failed");
    }
};