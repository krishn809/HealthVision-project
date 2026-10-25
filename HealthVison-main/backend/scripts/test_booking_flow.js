import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { Doctor } from "../src/models/doctor.model.js";
import { Timeslot } from "../src/models/timeslot.model.js";
import { Appointment } from "../src/models/appointment.models.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/healthvision";

async function testBookingFlow() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    try {
        // 1. Setup Data
        // Create a Doctor (User + Doctor profile)
        const doctorEmail = `testdoc_${Date.now()}@example.com`;
        const patientEmail = `testpat_${Date.now()}@example.com`;

        console.log("Creating Doctor User...");
        const doctorUser = await User.create({
            name: { first: "Test", last: "Doctor" },
            email: doctorEmail,
            password: "password123",
            role: "doctor",
            phone: "1234567890",
            dateOfBirth: new Date("1980-01-01"),
            gender: "Male",
            bloodGroup: "O+",
            height: 175,
            weight: 70,
            emergencyContact: {
                name: "Emergency Contact",
                phone: "0987654321",
                relation: "Spouse",
            },
        });

        console.log("Creating Doctor Profile...");
        const doctorProfile = await Doctor.create({
            userId: doctorUser._id,
            name: "Test Doctor",
            specialization: "General",
            experience: 5,
            fee: 500,
            qualifications: "MBBS, MD",
            about: "Experienced general physician.",
            location: "Karrahi",
            registration: "REG12345",
            contact: "1234567890",
        });

        console.log("Creating Patient User...");
        const patientUser = await User.create({
            name: { first: "Test", last: "Patient" },
            email: patientEmail,
            password: "password123",
            role: "patient",
            phone: "1234567890",
            dateOfBirth: new Date("1990-01-01"),
            gender: "Female",
            bloodGroup: "A+",
            height: 165,
            weight: 60,
            emergencyContact: {
                name: "Emergency Contact",
                phone: "0987654321",
                relation: "Parent",
            },
        });

        // Create a Timeslot
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + 1); // Tomorrow
        testDate.setHours(10, 0, 0, 0);

        console.log("Creating Timeslot...");
        const timeslot = await Timeslot.create({
            doctorId: doctorUser._id, // Using User ID based on controller logic
            date: testDate,
            time: "10:00 AM",
            status: "Available",
        });

        console.log(
            `Created Timeslot: ${timeslot._id} for Doctor: ${doctorUser._id}`,
        );

        // 2. Simulate Booking (Success Case)
        console.log("Testing Successful Booking...");

        // Replicating controller logic:
        const foundSlot = await Timeslot.findOne({
            doctorId: doctorUser._id,
            date: testDate,
            time: "10:00 AM",
            status: "Available",
        });

        if (!foundSlot) throw new Error("Timeslot not found!");

        const appointment = await Appointment.create({
            userId: patientUser._id,
            doctorId: doctorUser._id,
            date: testDate,
            time: "10:00 AM",
            status: "Scheduled",
            paymentStatus: "Pending",
        });

        foundSlot.status = "Booked";
        await foundSlot.save();

        console.log("Booking successful. Appointment ID:", appointment._id);

        // 3. Verify Timeslot Status
        const updatedSlot = await Timeslot.findById(timeslot._id);
        console.log(`Updated Timeslot Status: ${updatedSlot.status}`);
        if (updatedSlot.status !== "Booked")
            throw new Error("Timeslot status failed to update!");

        // 4. Test Double Booking (Conflict Case)
        console.log("Testing Double Booking (should fail)...");
        const conflictSlot = await Timeslot.findOne({
            doctorId: doctorUser._id,
            date: testDate,
            time: "10:00 AM",
            status: "Available",
        });

        if (conflictSlot) {
            throw new Error(
                "Double booking check failed! Timeslot was found as Available.",
            );
        } else {
            console.log("Success: Timeslot correctly unavailable.");
        }

        console.log("Test Complete: All checks passed.");
    } catch (error) {
        console.error("Test Failed:", error);
        console.error(JSON.stringify(error, null, 2));
    } finally {
        await mongoose.connection.close();
    }
}

testBookingFlow();
