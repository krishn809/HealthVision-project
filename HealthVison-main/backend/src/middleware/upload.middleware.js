import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'healthvision_reports',
        // Allow PDF and specific image formats
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
        // For raw files like PDF, it's often better to set resource_type: "raw" or "auto"
        resource_type: 'auto', 
        public_id: (req, file) => {
            // Generate unique filename: timestamp-originalname
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Remove extension from originalname since Cloudinary adds it based on format (except for raw resources sometimes, but auto handles it)
            const baseName = file.originalname.replace(/\.[^/.]+$/, "");
            return uniqueSuffix + '-' + baseName;
        }
    }
});

// File filter to validate file types before uploading
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and image files (JPEG, JPG, PNG) are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    }
});

export default upload;
