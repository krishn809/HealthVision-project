import Report from '../models/report.model.js';
import fs from 'fs';
import path from 'path';

import {
    isValidObjectId,
    validatePagination,
    getPaginationMetadata
} from "../utils/validation.utils.js";
import { analyzeReport as analyzeReportML } from '../services/ml.service.js';

import cloudinary from '../config/cloudinary.js';

/**
 * Upload a new report
 * POST /api/reports/upload
 */
export const uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const report = new Report({
            userId: req.user.id,
            fileName: req.file.originalname,
            fileUrl: req.file.path, // Cloudinary URL
            cloudinaryId: req.file.filename, // Cloudinary Public ID
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            status: 'pending'
        });

        await report.save();

        res.status(201).json({
            message: 'Report uploaded successfully',
            report: {
                id: report._id,
                fileName: report.fileName,
                fileType: report.fileType,
                fileSize: report.fileSize,
                status: report.status,
                createdAt: report.createdAt
            }
        });
    } catch (error) {
        // If there's an error, delete the uploaded file from Cloudinary
        if (req.file && req.file.filename) {
            try {
                // Determine resource type based on mimetype
                let resourceType = 'auto';
                if (req.file.mimetype === 'application/pdf') {
                    resourceType = 'raw';
                } else if (req.file.mimetype.startsWith('image/')) {
                    resourceType = 'image';
                }
                
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: resourceType });
            } catch (err) {
                console.error("Failed to delete from Cloudinary upon save error:", err);
            }
        }
        res.status(500).json({ message: 'Error uploading report', error: error.message });
    }
};

/**
 * Get all reports for the authenticated user
 * GET /api/reports
 */
export const getUserReports = async (req, res) => {
    try {
        // Pagination with validation
        const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

        // Optional status filter
        const query = { userId: req.user.id };
        if (req.query.status && ['pending', 'processing', 'completed', 'failed'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        // Execute optimized query with pagination
        const [reports, totalCount] = await Promise.all([
            Report.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v -extractedText') // Exclude large text field for list view
                .lean(), // Use lean for better performance
            Report.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            message: 'Reports retrieved successfully',
            count: reports.length,
            totalCount,
            reports,
            pagination: getPaginationMetadata(totalCount, page, limit)
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            message: 'Error fetching reports',
            error: error.message
        });
    }
};
/**
 * Get a specific report by ID
 * GET /api/reports/:id
 */
export const getReportById = async (req, res) => {
    try {
        // Validate MongoDB ObjectId
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid report ID format'
            });
        }

        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).select('-__v').lean();

        if (!report) {
            return res.status(404).json({
                message: 'Report not found or you do not have access to it'
            });
        }

        res.status(200).json({
            message: 'Report retrieved successfully',
            report
        });
    } catch (error) {
        console.error('Error fetching report:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid report ID'
            });
        }

        res.status(500).json({
            message: 'Error fetching report',
            error: error.message
        });
    }
};

/**
 * Delete a report
 * DELETE /api/reports/:id
 */
export const deleteReport = async (req, res) => {
    try {
        // Validate MongoDB ObjectId
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid report ID format'
            });
        }

        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!report) {
            return res.status(404).json({
                message: 'Report not found or you do not have access to it'
            });
        }

        // Delete the file from Cloudinary with error handling
        if (report.cloudinaryId) {
            try {
                let resourceType = 'auto';
                if (report.fileType === 'application/pdf') {
                    resourceType = 'raw';
                } else if (report.fileType && report.fileType.startsWith('image/')) {
                    resourceType = 'image';
                }
                
                await cloudinary.uploader.destroy(report.cloudinaryId, { resource_type: resourceType });
            } catch (fileError) {
                console.error('Error deleting file from Cloudinary:', fileError);
                // Continue with database deletion even if file deletion fails
            }
        }

        // Delete from database
        await Report.deleteOne({ _id: req.params.id });

        res.status(200).json({
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting report:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid report ID'
            });
        }

        res.status(500).json({
            message: 'Error deleting report',
            error: error.message
        });
    }
};

/**
 * Analyze a report using ML API
 * POST /api/reports/analyze
 */
export const analyzeReport = async (req, res) => {
    try {
        const { reportId } = req.body;

        // Validate reportId
        if (!reportId) {
            return res.status(400).json({ message: 'Report ID is required' });
        }

        // Find the report
        const report = await Report.findOne({
            _id: reportId,
            userId: req.user.id
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // We rely on the Cloudinary URL existing
        if (!report.fileUrl) {
            return res.status(404).json({ message: 'Report file URL not found' });
        }

        // Update status to processing
        report.status = 'processing';
        await report.save();

        // Perform ML analysis by pinging the remote microservice
        const analysisResult = await analyzeReportML(report._id);

        if (analysisResult.success) {
            // The remote service directly updates the DB.
            // We can fetch the updated report to send back to the frontend.
            const updatedReport = await Report.findById(report._id);
            
            res.status(200).json({
                message: 'Report analyzed successfully',
                report: {
                    id: updatedReport._id,
                    fileName: updatedReport.fileName,
                    status: updatedReport.status,
                    analysisResult: updatedReport.analysisResult,
                    updatedAt: updatedReport.updatedAt
                },
                mlApiAvailable: true
            });
        } else {
            // Update report to failed if ML service ping failed
            report.status = 'failed';
            report.analysisResult = {
                error: analysisResult.message,
                mlApiAvailable: analysisResult.mlApiAvailable,
                attemptedAt: new Date()
            };
            await report.save();

            res.status(503).json({
                message: `Analysis failed: ${analysisResult.message}`,
                report: {
                    id: report._id,
                    fileName: report.fileName,
                    status: report.status,
                    analysisResult: report.analysisResult,
                    updatedAt: report.updatedAt
                },
                mlApiAvailable: analysisResult.mlApiAvailable
            });
        }

    } catch (error) {
        console.error('Error analyzing report:', error);

        // Try to update report status to failed if we have the reportId
        if (req.body.reportId) {
            try {
                await Report.findByIdAndUpdate(req.body.reportId, {
                    status: 'failed',
                    analysisResult: {
                        error: error.message,
                        failedAt: new Date()
                    }
                });
            } catch (updateError) {
                console.error('Error updating report status:', updateError);
            }
        }

        res.status(500).json({
            message: 'Error analyzing report',
            error: error.message
        });
    }
};
/**
 * Count the number of reports for dashboard
 * GET /api/reports/count
 */
export const countReports = async (req, res) => {
    try {
        // Use countDocuments for better performance instead of fetching all documents
        const totalCount = await Report.countDocuments({ userId: req.user.id });

        // Get counts by status for more detailed dashboard stats
        const statusCounts = await Report.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const countsByStatus = {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0
        };

        statusCounts.forEach(item => {
            countsByStatus[item._id] = item.count;
        });
        res.status(200).json({
            success: true,
            totalCount,
            countsByStatus
        });
    } catch (error) {
        console.error('Error counting reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching report counts',
            error: error.message
        });
    }
};