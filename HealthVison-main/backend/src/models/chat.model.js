import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true // Index for faster user-specific queries
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    response: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Low"
    },
    // Cross-feature relationship: Link to reports being discussed
    relatedReports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report"
    }],
    // Context tracking for better chatbot responses
    context: {
        type: String,
        enum: ["general", "report_analysis", "appointment", "medical_query"],
        default: "general"
    },
    // Metadata for analytics and debugging
    metadata: {
        reportIds: [String], // IDs of reports mentioned in conversation
        keywords: [String], // Extracted keywords for search
        sentiment: String // Optional: positive, neutral, negative
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting by time
    }
    }, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficient user history queries with pagination
chatMessageSchema.index({ userId: 1, timestamp: -1 });

// Index for context-based queries
chatMessageSchema.index({ userId: 1, context: 1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
