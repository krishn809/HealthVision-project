/**
 * Migration script: marks ALL existing doctors as isReal = false
 * Run once to tag demo/seeded doctors.
 * Usage: node scripts/markDoctorsNotReal.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doctor } from "../src/models/doctor.model.js";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB...");

        const result = await Doctor.updateMany({}, { $set: { isReal: false } });
        console.log(
            `✅ Marked ${result.modifiedCount} doctor(s) as isReal = false (demo).`
        );

        process.exit(0);
    } catch (error) {
        console.error("❌ Error running migration:", error);
        process.exit(1);
    }
};

run();
