const bcrypt = require("bcrypt");
const { User } = require("./models/user");
const BloodReport = require("./models/bloodReport");
const { File } = require("./models/file");
const Conversation = require("./models/conversation");

async function seedDemoData() {
    try {
        const demoEmail = "demo@123";
        let user = await User.findOne({ email: demoEmail });

        const saltRounds = Number(process.env.SALT) || 10;
        const hashedPassword = await bcrypt.hash("password@24", saltRounds);

        const userData = {
            firstName: "Krishn",
            lastName: "Kushwaha",
            email: demoEmail,
            password: hashedPassword,
            age: 20,
            height: "5'10\"",
            weight: "162 lbs.",
            ethnicity: "Asian",
            sex: "Male"
        };

        if (!user) {
            user = new User(userData);
            await user.save();
            console.log("Demo user seeded successfully: Krishn Kushwaha (demo@123)");
        } else {
            Object.assign(user, userData);
            await user.save();
            console.log("Demo user updated successfully: Krishn Kushwaha (demo@123)");
        }

        const userId = user._id;

        // Check if blood reports already exist for this user
        const existingReports = await BloodReport.find({ userId });
        if (existingReports.length === 0) {
            const report1Date = new Date();
            report1Date.setDate(report1Date.getDate() - 60);

            const report2Date = new Date();
            report2Date.setDate(report2Date.getDate() - 30);

            const report3Date = new Date();
            report3Date.setDate(report3Date.getDate() - 2);

            const bloodReports = [
                {
                    userId,
                    reportDate: report1Date,
                    description: "Baseline Complete Metabolic & Lipid Panel",
                    biomarkers: [
                        { name: "Hemoglobin", description: "Oxygen-carrying protein in red blood cells", result: 14.8, unit: "g/dL", referenceRange: { min: 13.8, max: 17.2 } },
                        { name: "Fasting Blood Glucose", description: "Blood sugar level after overnight fast", result: 95, unit: "mg/dL", referenceRange: { min: 70, max: 99 } },
                        { name: "Total Cholesterol", description: "Overall measure of blood cholesterol", result: 185, unit: "mg/dL", referenceRange: { min: 125, max: 200 } },
                        { name: "Vitamin D", description: "Crucial for bone density and immune defense", result: 28, unit: "ng/mL", referenceRange: { min: 30, max: 100 } },
                        { name: "Creatinine", description: "Kidney filtration and muscular metabolism marker", result: 0.98, unit: "mg/dL", referenceRange: { min: 0.74, max: 1.35 } },
                        { name: "White Blood Cell Count", description: "Primary immune and infection defense cells", result: 6.4, unit: "x10^3/uL", referenceRange: { min: 4.5, max: 11.0 } }
                    ]
                },
                {
                    userId,
                    reportDate: report2Date,
                    description: "Mid-Term Biomarker Progression Check",
                    biomarkers: [
                        { name: "Hemoglobin", description: "Oxygen-carrying protein in red blood cells", result: 15.1, unit: "g/dL", referenceRange: { min: 13.8, max: 17.2 } },
                        { name: "Fasting Blood Glucose", description: "Blood sugar level after overnight fast", result: 91, unit: "mg/dL", referenceRange: { min: 70, max: 99 } },
                        { name: "Total Cholesterol", description: "Overall measure of blood cholesterol", result: 176, unit: "mg/dL", referenceRange: { min: 125, max: 200 } },
                        { name: "Vitamin D", description: "Crucial for bone density and immune defense", result: 32, unit: "ng/mL", referenceRange: { min: 30, max: 100 } },
                        { name: "Creatinine", description: "Kidney filtration and muscular metabolism marker", result: 0.94, unit: "mg/dL", referenceRange: { min: 0.74, max: 1.35 } },
                        { name: "White Blood Cell Count", description: "Primary immune and infection defense cells", result: 6.6, unit: "x10^3/uL", referenceRange: { min: 4.5, max: 11.0 } }
                    ]
                },
                {
                    userId,
                    reportDate: report3Date,
                    description: "Comprehensive Health Vision Clinical Diagnostics Panel",
                    biomarkers: [
                        { name: "Hemoglobin", description: "Oxygen-carrying protein in red blood cells", result: 15.4, unit: "g/dL", referenceRange: { min: 13.8, max: 17.2 } },
                        { name: "Fasting Blood Glucose", description: "Blood sugar level after overnight fast", result: 88, unit: "mg/dL", referenceRange: { min: 70, max: 99 } },
                        { name: "Total Cholesterol", description: "Overall measure of blood cholesterol", result: 168, unit: "mg/dL", referenceRange: { min: 125, max: 200 } },
                        { name: "Vitamin D", description: "Crucial for bone density and immune defense", result: 36, unit: "ng/mL", referenceRange: { min: 30, max: 100 } },
                        { name: "Creatinine", description: "Kidney filtration and muscular metabolism marker", result: 0.92, unit: "mg/dL", referenceRange: { min: 0.74, max: 1.35 } },
                        { name: "White Blood Cell Count", description: "Primary immune and infection defense cells", result: 7.0, unit: "x10^3/uL", referenceRange: { min: 4.5, max: 11.0 } }
                    ]
                }
            ];

            await BloodReport.insertMany(bloodReports);
            console.log("Demo blood report panels seeded for Krishn Kushwaha.");
        }

        // Seed file archive records
        const existingFiles = await File.find({ userId });
        if (existingFiles.length === 0) {
            await File.create([
                {
                    userId,
                    fileName: "Clinical_Comprehensive_Panel_2026.pdf",
                    filePath: "/data/uploads/Clinical_Comprehensive_Panel_2026.pdf",
                    description: "Comprehensive 24-biomarker full metabolic & CBC blood report",
                    testDate: new Date()
                },
                {
                    userId,
                    fileName: "Lipid_Metabolic_Profile_Q1.pdf",
                    filePath: "/data/uploads/Lipid_Metabolic_Profile_Q1.pdf",
                    description: "Quarterly lipid tracking and fasting glucose diagnostics",
                    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            ]);
            console.log("Demo lab report files seeded for Krishn Kushwaha.");
        }

        // Seed sample conversation thread for AI Chatbot
        const existingConvs = await Conversation.find({ userId });
        if (existingConvs.length === 0) {
            await Conversation.create({
                userId,
                conversationID: "demo-conv-001",
                topic: "Biomarker Telemetry & Metabolic Health Review",
                messages: [
                    {
                        sender: "user",
                        message: "How are my Vitamin D and Fasting Blood Glucose trends looking across my recent reports?"
                    },
                    {
                        sender: "bot",
                        message: "Hello Krishn! Your biomarker trajectory is showing positive progress: \n\n1. Vitamin D: Rose from 28 ng/mL to 36 ng/mL, now solidly within the healthy reference range (30-100 ng/mL).\n2. Fasting Blood Glucose: Decreased from 95 mg/dL to 88 mg/dL, well within normal fasting range (70-99 mg/dL).\n3. Total Cholesterol: Improved steadily from 185 mg/dL to 168 mg/dL.\n\nOverall, your metabolic biomarkers indicate optimal cellular health and cardiovascular resilience."
                    }
                ]
            });
            console.log("Demo conversation history seeded for Krishn Kushwaha.");
        }
    } catch (err) {
        console.error("Error seeding demo data:", err.message);
    }
}

module.exports = seedDemoData;
