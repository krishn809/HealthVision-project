import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    extractedText: {
        type: String,
        default: null
    },
    analysisResult: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    cloudinaryId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Add index for dashboard stats optimization
reportSchema.index({ userId: 1 });

// Compound index for status-based queries (e.g., get all pending reports for a user)
reportSchema.index({ userId: 1, status: 1 });

// Index for sorting by creation date
reportSchema.index({ userId: 1, createdAt: -1 });

// Text index for searching extracted text
reportSchema.index({ extractedText: 'text' });

const Report = mongoose.model('Report', reportSchema);

export default Report;
