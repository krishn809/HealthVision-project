const router = require("express").Router();
const { File, validateFile } = require("../models/file");
const multer = require("multer");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const AWS = require('aws-sdk');
const pdf = require('pdf-parse');
const { getFilesByUserId } = require('../controllers/fileRetrieval');
const biomarkerDescriptions = require("../data/biomarkers.json");
const fs = require('fs');
const path = require('path');

const biomarkersPath = path.resolve(__dirname, '../data/biomarkers.json');
const biomarkersData = JSON.parse(fs.readFileSync(biomarkersPath, 'utf-8'));

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
//const comprehendMedical = new AWS.ComprehendMedical();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024
    }
});

router.get('/:token', async (req, res) => {
    const secret = process.env.JWTPRIVATEKEY || "elixer_ai_jwt_secret_key_2024";
    const decoded = jwt.verify(req.params.token, secret);
    const userId = decoded._id;

    try {
        const files = await File.find({ userId: userId });
        const urls = files.map(file => {
            let fileUrl = file.filePath;
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
                try {
                    const params = {
                        Bucket: 'medical-reports-01',
                        Key: file.fileName,
                        Expires: 60 * 5
                    };
                    fileUrl = s3.getSignedUrl('getObject', params);
                } catch (s3Err) {
                    console.warn("Failed to generate presigned S3 URL:", s3Err.message);
                }
            }
            return {
                ...file._doc,
                url: fileUrl
            };
        });
        res.json(urls);
    } catch (error) {
        res.status(500).json({ message: "Error fetching files" });
    }
});

const extractBiomarkerResults = async (pdfBuffer) => {
    const pdfData = await pdf(pdfBuffer); // Extract raw text
    const text = pdfData.text;
    return parseBiomarkers(text);
};

const parseBiomarkers = (text) => {
    const biomarkers = [];
    const lines = text.split('\n');

    // Iterate through biomarkers.json keys, ordered by length of names/aliases (longest first)
    const sortedBiomarkers = Object.entries(biomarkersData).sort(
        ([a], [b]) => b.length - a.length
    );

    sortedBiomarkers.forEach(([biomarker, biomarkerData]) => {
        // Build a regex to match the full name first, followed by aliases
        const aliasPatterns = [biomarker, ...(biomarkerData.aliases || [])]
            .map(alias => `\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`) // Add word boundaries to avoid partial matches
            .join('|');

        // Match biomarker name/alias and a valid numeric value not followed by a range
        const regex = new RegExp(`(${aliasPatterns}).*?([0-9.]+)(?!\\s*-\\s*[0-9.])`, 'i');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(regex);
            if (match) {
                let resultValue = parseFloat(match[2]);

                // Validate the extracted result to avoid unrealistic values
                if (isNaN(resultValue) || resultValue < 0 || resultValue > 1e6) {
                    continue; // Skip invalid matches
                }

                // Normalize the value dynamically if it's significantly smaller than the reference range
                const minRef = biomarkerData.referenceRange.min;
                if (resultValue < minRef / 100) {
                    const scalingFactor = Math.pow(10, Math.floor(Math.log10(minRef)) - Math.floor(Math.log10(resultValue)));
                    resultValue *= scalingFactor;
                }

                // Add the biomarker to the results
                biomarkers.push({
                    testName: biomarker,
                    description: biomarkerData.description,
                    resultValue,
                    unit: biomarkerData.unit,
                    referenceRange: biomarkerData.referenceRange,
                    status: getBiomarkerStatus(resultValue, biomarkerData.referenceRange),
                });

                // Move to the next line after a match to prevent overlapping matches
                break;
            }
        }
    });

    return biomarkers;
};

// Helper function to determine biomarker status
const getBiomarkerStatus = (result, referenceRange) => {
    if (result < referenceRange.min) {
        return "Low";
    } else if (result > referenceRange.max) {
        return "High";
    } else {
        return "Normal";
    }
};

router.post("/", upload.single("file"), async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return res.status(401).send({ message: "Authorization token is required." });

        const token = authHeader.replace("Bearer ", "");
        const secret = process.env.JWTPRIVATEKEY || "elixer_ai_jwt_secret_key_2024";
        const decoded = jwt.verify(token, secret);
        const userId = decoded._id;

        if (!req.file) return res.status(400).send({ message: "File is required." });

        let fileLocation = "";
        let biomarkers = [];

        try {
            biomarkers = await extractBiomarkerResults(req.file.buffer);
        } catch (error) {
            console.error("Error parsing PDF:", error);
            return res.status(500).send({ message: "Error processing PDF data." });
        }

        // Check if AWS S3 is configured
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            try {
                const params = {
                    Bucket: "medical-reports-01",
                    Key: `${Date.now()}_${req.file.originalname}`,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype || "application/pdf",
                };
                const s3Data = await s3.upload(params).promise();
                fileLocation = s3Data.Location;
            } catch (s3Err) {
                console.warn("S3 upload failed, saving locally:", s3Err.message);
            }
        }

        // Local storage fallback if not saved to S3
        if (!fileLocation) {
            const uploadDir = path.resolve(__dirname, "../data/uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const localFileName = `${Date.now()}_${req.file.originalname}`;
            const localFilePath = path.join(uploadDir, localFileName);
            fs.writeFileSync(localFilePath, req.file.buffer);
            fileLocation = `/data/uploads/${localFileName}`;
        }

        const file = new File({
            userId,
            fileName: req.file.originalname,
            filePath: fileLocation,
            description: req.body.description || "",
            testDate: req.body.testDate || new Date()
        });

        await file.save();

        res.status(201).send({
            message: "File uploaded and biomarker results extracted successfully!",
            biomarkers,
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

const validateData = (data) => {
    const dataSchema = Joi.object({
        token: Joi.string().required(),
        fileName: Joi.string().required(),
        filePath: Joi.binary().required(),
        description: Joi.string().allow('').optional(),
        testDate: Joi.date().required()
    });
    return dataSchema.validate(data);
}


module.exports = router;
