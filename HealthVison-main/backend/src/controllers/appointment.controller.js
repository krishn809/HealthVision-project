import { Appointment } from "../models/appointment.models.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Timeslot } from "../models/timeslot.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createAppointment = asyncHandler(async (req, res) => {
    const { doctorId, date, time } = req.body;
    const userId = req.user._id;

    if (!doctorId || !date || !time) {
        throw new ApiError(400, "All fields are required");
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    // Check if slot is already booked
    let timeslot = await Timeslot.findOne({
        doctorId,
        date: new Date(date),
        time
    });

    if (timeslot && timeslot.status === "Booked") {
        throw new ApiError(409, "Selected timeslot is not available");
    }

    // If slot exists and available, or doesn't exist, mark/create as Pending
    if (timeslot) {
        timeslot.status = "Pending";
        await timeslot.save();
    } else {
        timeslot = await Timeslot.create({
            doctorId,
            date: new Date(date),
            time,
            status: "Pending"
        });
    }

    const appointment = await Appointment.create({
        userId,
        doctorId,
        date,
        time,
        status: "Pending",
        paymentStatus: "Pending"
    });

    return res.status(201).json(new ApiResponse(201, appointment, "Appointment created successfully"));
});

export const getAppointments = asyncHandler(async (req, res) => {
    const user = req.user;
    let query = { userId: user._id };

    if (user.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: user._id });
        if (doctor) {
            query = { doctorId: doctor._id };
        }
    }

    const appointments = await Appointment.find(query)
        .populate("userId", "name email avatarUrl")
        .populate("doctorId", "name specialization location avatarUrl userId");

    // Auto-update past appointments to "Completed"
    const now = new Date();
    const updatedAppointments = await Promise.all(appointments.map(async (app) => {
        if (app.status === "Scheduled") {
            const appDateTime = new Date(app.date);
            const [hours, minutes] = app.time.split(':').map(Number);
            appDateTime.setHours(hours, minutes, 0, 0);

            if (appDateTime < now) {
                app.status = "Completed";
                await app.save();
            }
        }
        return app;
    }));

    return res.status(200).json(new ApiResponse(200, updatedAppointments, "Appointments fetched successfully"));
});

export const getAppointmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
        .populate("userId", "name email avatarUrl")
        .populate("doctorId", "name specialization location avatarUrl userId");

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Role-based authorization
    let isAuthorized = appointment.userId._id.toString() === req.user._id.toString();
    if (!isAuthorized && req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (doctor && appointment.doctorId._id.toString() === doctor._id.toString()) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        throw new ApiError(403, "Unauthorized to access this appointment");
    }

    return res.status(200).json(new ApiResponse(200, appointment, "Appointment fetched successfully"));
});

export const updateAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    let isAuthorized = appointment.userId.toString() === req.user._id.toString();
    if (!isAuthorized && req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (doctor && appointment.doctorId.toString() === doctor._id.toString()) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        throw new ApiError(403, "Unauthorized to update this appointment");
    }

    if (status) appointment.status = status;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;

    await appointment.save();

    return res.status(200).json(new ApiResponse(200, appointment, "Appointment updated successfully"));
});

export const deleteAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    let isAuthorized = appointment.userId.toString() === req.user._id.toString();
    if (!isAuthorized && req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (doctor && appointment.doctorId.toString() === doctor._id.toString()) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        throw new ApiError(403, "Unauthorized to delete this appointment");
    }

    await Appointment.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Appointment deleted successfully"));
});

export const getTimeslotsForDoctor = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
        throw new ApiError(400, "Date parameter is required");
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    // 1. Define standard working hours (9:00 AM to 5:00 PM)
    const startHour = 9;
    const endHour = 16;

    const allSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
        // Hour:00
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        allSlots.push(timeStr);

        // Hour:30
        const timeStrHalf = `${hour.toString().padStart(2, '0')}:30`;
        allSlots.push(timeStrHalf);
    }

    // 2. Fetch booked slots from DB
    // We search for slots that are specifically BOOKED for this doctor on this date
    // Note: 'date' comes as string YYYY-MM-DD.
    // Timeslot model stores date as Date object. We need to match the day.
    const queryDate = new Date(date);

    // Create start and end of the day for query
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAndPendingSlots = await Timeslot.find({
        doctorId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: { $in: ["Booked", "Pending"] }
    }).select("time status updatedAt");

    // Consider "Pending" as booked only if it was updated in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const bookedTimes = bookedAndPendingSlots
        .filter(slot => {
            if (slot.status === "Booked") return true;
            return slot.updatedAt > fifteenMinutesAgo;
        })
        .map(slot => slot.time);

    // 3. Construct response and filter past slots for the current date
    const now = new Date();
    const isToday = queryDate.toDateString() === now.toDateString();

    const timeslotData = allSlots
        .map(time => {
            let isAvailable = !bookedTimes.includes(time);

            // If it's today, hide/disable slots that have already passed
            if (isToday && isAvailable) {
                const [slotHour, slotMinute] = time.split(':').map(Number);
                const slotDateTime = new Date(now);
                slotDateTime.setHours(slotHour, slotMinute, 0, 0);

                if (slotDateTime < now) {
                    isAvailable = false;
                }
            }

            return {
                id: `${date}-${time}`,
                time,
                isAvailable
            };
        })
        .filter(slot => {
            if (isToday) {
                const [slotHour, slotMinute] = slot.time.split(':').map(Number);
                const slotDateTime = new Date(now);
                slotDateTime.setHours(slotHour, slotMinute, 0, 0);
                return slotDateTime > now;
            }
            return true;
        });

    return res.status(200).json(new ApiResponse(200, timeslotData, "Timeslots fetched successfully"));
});
export const cancelAppointment = asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.userId._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to cancel this appointment");
    }

    let message = "Appointment cancelled successfully";
    if (appointment.paymentStatus === "Paid") {
        const user = await User.findById(req.user._id);
        const doctor = await Doctor.findById(appointment.doctorId);
        if (user && doctor) {
            const fee = doctor.fee || 500;
            const refundAmount = fee * 0.8;
            user.walletBalance = (user.walletBalance || 0) + refundAmount;
            await user.save();
            message = `Appointment cancelled successfully. A refund of ₹${refundAmount} (after 20% cancellation fee) has been added to your HealthVision Wallet`;
        }
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Send cancellation email (async, don't block response)
    const sendCancellationEmail = async () => {
        try {
            const user = await User.findById(req.user._id);
            const doctor = await Doctor.findById(appointment.doctorId);

            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background-color: #dc3545; padding: 25px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HealthVision</h1>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <span style="background-color: #fce8e6; color: #dc3545; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Appointment Cancelled</span>
                        </div>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6;">Dear <strong>${user.name.first || user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 20px;">This is to confirm that your appointment has been cancelled.</p>
                        
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #777777; font-size: 14px; width: 100px;">Doctor</td>
                                    <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${doctor.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #777777; font-size: 14px;">Date</td>
                                    <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${new Date(appointment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #777777; font-size: 14px;">Time</td>
                                    <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${appointment.time}</td>
                                </tr>
                            </table>
                        </div>

                        ${appointment.paymentStatus === "Paid" ? `
                        <div style="border-left: 4px solid #ffc107; background-color: #fff9e6; padding: 15px; margin-bottom: 25px;">
                            <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                <strong>Refund Notice:</strong> Your payment will be transferred to your HealthVision Wallet shortly.
                            </p>
                        </div>
                        ` : ''}
                        
                        <p style="font-size: 14px; color: #777777; text-align: center; margin-top: 30px;">
                            If you did not request this cancellation, please contact our support team.
                        </p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="font-size: 12px; color: #999999; margin: 0;">&copy; 2026 HealthVision. All rights reserved.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: user.email,
                subject: "Appointment Cancelled - HealthVision",
                message: `Your appointment with Dr. ${doctor.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been cancelled.`,
                html: emailHtml
            });
        } catch (error) {
            console.error("Cancellation email failed:", error);
        }
    };
    sendCancellationEmail();

    // Release the timeslot
    await Timeslot.deleteOne({
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time
    });

    return res.status(200).json(new ApiResponse(200, {}, message));
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
        throw new ApiError(400, "New date and time are required");
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.userId._id.toString() !== req.user._id.toString() && appointment.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to reschedule this appointment");
    }

    if (appointment.status !== "Scheduled") {
        throw new ApiError(400, `Cannot reschedule appointment with status: ${appointment.status}`);
    }

    // 1. Check if the new slot is available
    const existingSlot = await Timeslot.findOne({
        doctorId: appointment.doctorId,
        date: new Date(date),
        time
    });

    if (existingSlot && existingSlot.status === "Booked") {
        throw new ApiError(409, "The selected timeslot is already booked");
    }

    // 2. Release the old timeslot
    await Timeslot.deleteOne({
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time
    });

    // 3. Create/Update the new timeslot
    if (existingSlot) {
        existingSlot.status = "Booked";
        await existingSlot.save();
    } else {
        await Timeslot.create({
            doctorId: appointment.doctorId,
            date: new Date(date),
            time,
            status: "Booked"
        });
    }

    // 4. Update the appointment
    const oldDate = appointment.date;
    const oldTime = appointment.time;

    appointment.date = new Date(date);
    appointment.time = time;
    await appointment.save();

    // 5. Send rescheduling confirmation email (async)
    const sendRescheduleEmail = async () => {
        try {
            const user = await User.findById(req.user._id);
            const doctor = await Doctor.findById(appointment.doctorId);

            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background-color: #f97316; padding: 25px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">HealthVision</h1>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <span style="background-color: #ffedd5; color: #ea580c; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Appointment Rescheduled</span>
                        </div>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6;">Dear <strong>${user.name.first || user.name}</strong>,</p>
                        <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 20px;">Your appointment has been successfully rescheduled.</p>
                        
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">New Appointment Details</h4>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #777777; font-size: 14px; width: 100px;">Doctor</td>
                                    <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${doctor.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #777777; font-size: 14px;">Date</td>
                                    <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #777777; font-size: 14px;">Time</td>
                                    <td style="padding: 8px 0; color: #333333; font-weight: 600; font-size: 15px;">${time}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="font-size: 13px; color: #999; text-align: center;">
                            Previous details: ${new Date(oldDate).toLocaleDateString()} at ${oldTime}
                        </div>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="font-size: 12px; color: #999999; margin: 0;">&copy; 2026 HealthVision. All rights reserved.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: user.email,
                subject: "Appointment Rescheduled - HealthVision",
                message: `Your appointment with ${doctor.name} has been rescheduled to ${new Date(date).toLocaleDateString()} at ${time}.`,
                html: emailHtml
            });
        } catch (error) {
            console.error("Rescheduling email failed:", error);
        }
    };
    sendRescheduleEmail();

    return res.status(200).json(new ApiResponse(200, appointment, "Appointment rescheduled successfully"));
});
