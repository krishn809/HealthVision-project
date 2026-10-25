import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";
import { Doctor } from "./src/models/doctor.model.js";
import { Appointment } from "./src/models/appointment.models.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const doctors = await Doctor.find();
        const doctorMap = {};
        doctors.forEach(d => doctorMap[d._id.toString()] = d.name);

        console.log("\n--- Current Doctors in DB ---");
        doctors.forEach(d => {
            console.log(`ID: ${d._id}, Name: ${d.name}, UserID: ${d.userId}`);
        });

        const appointments = await Appointment.find().sort({ createdAt: -1 }).limit(10);
        console.log("\n--- Last 10 Appointments ---");
        for (const a of appointments) {
            const docName = doctorMap[a.doctorId.toString()] || "UNKNOWN DOCTOR (Not in DB)";
            console.log(`AppId: ${a._id}`);
            console.log(`  Doctor: ${docName} (ID: ${a.doctorId})`);
            console.log(`  CreatedAt: ${a.createdAt}`);
            console.log(`  Status: ${a.status}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkData();
