import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doctor } from "../src/models/doctor.model.js";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "../.env") });

const hospitals = [
    "Vatsalya Hospital, Kanpur",
    "Regency Hospital, Kanpur",
    "Fortune Hospital, Kanpur",
    "The Panacea Hospital, Kanpur",
    "Apollo Spectra Hospitals, Kanpur",
    "Merrygold Hospital, Kanpur",
    "The Gastro-Liver Hospital, Kanpur",
    "Mahendru Hospital, Kanpur",
    "Madhuraj Hospital, Kanpur",
    "Kulwanti Hospital, Kanpur"
];

const doctors = [
    {
        name: "Dr. Abhay Tripathi",
        specialization: "Cardiologist",
        experience: 15,
        rating: 4.9,
        availability: ["Mon-Fri 10:00 AM - 02:00 PM", "Sat 10:00 AM - 01:00 PM"],
        fee: 1500,
        about: "Dr. Abhay Tripathi is a renowned Cardiologist with over 15 years of experience. He specializes in interventional cardiology and has performed numerous successful angioplasties. He is dedicated to patient care and preventive cardiology.",
        qualifications: "MBBS, MD (General Medicine), DM (Cardiology)",
        location: hospitals[1], // Regency
        languages: ["English", "Hindi"],
        registration: "Reg. No. UP-12345 (UPMC)",
        contact: "+91 98765 43210",
        isApproved: true
    },
    {
        name: "Dr. Gaurav Gupta",
        specialization: "Dermatologist",
        experience: 8,
        rating: 4.7,
        availability: ["Mon-Sat 11:00 AM - 04:00 PM"],
        fee: 800,
        about: "Dr. Gaurav Gupta is a skilled Dermatologist known for his expertise in treating acne, psoriasis, and other skin conditions. He also offers cosmetic dermatology services.",
        qualifications: "MBBS, MD (Dermatology)",
        location: hospitals[4], // Apollo Spectra
        languages: ["English", "Hindi"],
        registration: "Reg. No. UP-67890 (UPMC)",
        contact: "+91 98765 11111"
    },
    {
        name: "Dr. Isha Tripathi",
        specialization: "Dentist",
        experience: 10,
        rating: 4.8,
        availability: ["Mon-Fri 09:00 AM - 01:00 PM", "Mon-Fri 05:00 PM - 08:00 PM"],
        fee: 1000,
        about: "Dr. Isha Tripathi is a compassionate Dentist with a focus on painless dentistry. She has extensive experience in root canal treatments, crowns, and bridges.",
        qualifications: "BDS, MDS (Prosthodontics)",
        location: hospitals[0], // Vatsalya
        languages: ["English", "Hindi"],
        registration: "Reg. No. UP-54321 (UPMC)",
        contact: "+91 98765 22222"
    },
    {
        name: "Dr. Sadhna Yadav",
        specialization: "Gynecologist",
        experience: 12,
        rating: 4.9,
        availability: ["Mon-Sat 10:30 AM - 02:30 PM"],
        fee: 1200,
        about: "Dr. Sadhna Yadav is a trusted Gynecologist and Obstetrician. She specializes in high-risk pregnancies and laparoscopic surgeries.",
        qualifications: "MBBS, MS (Obstetrics & Gynecology)",
        location: hospitals[5], // Merrygold
        languages: ["English", "Hindi"],
        registration: "Reg. No. UP-98765 (UPMC)",
        contact: "+91 98765 33333"
    },
    {
        name: "Dr. Amit Sharma",
        specialization: "Orthopedic Surgeon",
        experience: 20,
        rating: 4.6,
        availability: ["Tue-Sun 10:00 AM - 02:00 PM"],
        fee: 2000,
        about: "Dr. Amit Sharma is a senior Orthopedic Surgeon with 20 years of experience. He specializes in joint replacement and trauma surgeries.",
        qualifications: "MBBS, MS (Orthopedics)",
        location: hospitals[3], // Panacea
        languages: ["English", "Hindi"],
        registration: "Reg. No. UP-11223 (UPMC)",
        contact: "+91 98765 44444"
    },
    {
        name: "Dr. Rohit Saxena",
        specialization: "General Physician",
        experience: 25,
        rating: 4.5,
        availability: ["Mon-Sat 09:00 AM - 09:00 PM"],
        fee: 500,
        about: "Dr. Rohit Saxena is a dedicated General Physician treating a wide range of acute and chronic illnesses. He emphasizes holistic well-being.",
        qualifications: "MBBS, MD (Internal Medicine)",
        location: hospitals[2], // Fortune
        languages: ["English", "Hindi"],
        registration: "Reg. No. UP-33445 (UPMC)",
        contact: "+91 98765 55555"
    },
    {
        name: "Dr. Anshul Atre",
        specialization: "Neuro Surgeon",
        experience: 18,
        rating: 4.9,
        availability: ["Mon-Fri 10:00 AM - 04:00 PM"],
        fee: 2500,
        about: "Dr. Anshul Atre is a distinguished Neuro Surgeon with expertise in complex brain and spine surgeries. He is known for his precision and patient-centric approach.",
        qualifications: "MBBS, MS (Surgery), MCh (Neurosurgery)",
        location: hospitals[2], // Fortune Hospital
        languages: ["English", "Hindi"],
        registration: "Reg. No. UP-99887 (UPMC)",
        contact: "+91 98765 67890",
        isApproved: false // One pending doctor for demo
    },
    {
        name: "Dr. Satyasundara Mahapatra",
        specialization: "Dermatologist",
        experience: 12,
        rating: 4.8,
        availability: ["Mon-Sat 11:00 AM - 03:00 PM"],
        fee: 900,
        about: "Dr. Satyasundara Mahapatra provides comprehensive care for skin, hair, and nail conditions. He specializes in both clinical and aesthetic dermatology.",
        qualifications: "MBBS, MD (Dermatology)",
        location: hospitals[8], // Madhuraj Hospital
        languages: ["English", "Hindi", "Odia"],
        registration: "Reg. No. UP-77665 (UPMC)",
        contact: "+91 98765 13579",
        isApproved: true
    }
];

import { User } from "../src/models/user.model.js";

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await Doctor.deleteMany({});
        // Optional: Clear doctor users too? Let's clear users with role 'doctor'
        await User.deleteMany({ role: "doctor" });
        console.log("Cleared existing doctor and doctor-user data.");

        // Insert new data
        for (const doc of doctors) {
            // Create a unique clean email: remove "Dr.", trim, lowercase, replace spaces with dots
            const cleanName = doc.name.replace(/dr\.\s+/i, '').trim().toLowerCase();
            const email = `${cleanName.split(' ').join('.')}@healthviz.in`;

            // Create a User account for the doctor
            const user = await User.create({
                name: {
                    first: doc.name.split(' ')[1],
                    last: doc.name.split(' ')[2] || ""
                },
                email,
                password: "doctor123", // Default password for seeded doctors
                role: "doctor",
                phone: doc.contact,
                dateOfBirth: new Date("1980-01-01"), // Default DOB
                gender: "Male", // Default gender, can be adjusted
                bloodGroup: "O+",
                height: 175,
                weight: 70,
                emergencyContact: {
                    name: "Emergency",
                    phone: doc.contact,
                    relation: "Colleague"
                }
            });

            // Create the Doctor profile linked to the User
            await Doctor.create({
                ...doc,
                userId: user._id,
                isApproved: doc.isApproved !== undefined ? doc.isApproved : true
            });

            console.log(`Seeded: ${doc.name} (Email: ${email})`);
        }

        console.log("Successfully seeded doctor and user data!");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedDoctors();
