import { ChatMessage } from "../models/chat.model.js";
import Report from "../models/report.model.js";
import axios from 'axios';
import logger from '../utils/logger.js';
import {
    isValidObjectId,
    validatePagination,
    getPaginationMetadata,
    validateDateRange,
    validateEnum
} from "../utils/validation.utils.js";

 

export const sendMessage = async (req, res, next) => {
    try {
        const { message, urgency, reportId, context } = req.body;
        const userId = req.user.id;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Valid message text is required"
            });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Message is too long (max 5000 characters)"
            });
        }

        const validUrgencies = ['Low', 'Medium', 'High'];
        const messageUrgency = validateEnum(urgency, validUrgencies, 'Low');

        const validContexts = ['general', 'report_analysis', 'appointment', 'medical_query'];
        const messageContext = validateEnum(context, validContexts, 'general');

        let relatedReports = [];
        let reportContext = '';
        let report = null;
        let metadata = {
            reportIds: [],
            keywords: extractKeywords(message),
            sentiment: 'neutral'
        };

        if (reportId) {
            if (!isValidObjectId(reportId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid report ID format"
                });
            }

            try {
                report = await Report.findOne({
                    _id: reportId,
                    userId: userId
                }).select('fileName status analysisResult extractedText createdAt').lean();

                if (!report) {
                    return res.status(404).json({
                        success: false,
                        message: "Report not found or you don't have access to it"
                    });
                }

                if (report.status !== 'completed') {
                    return res.status(400).json({
                        success: false,
                        message: `Report analysis is ${report.status}. Please wait for analysis to complete.`,
                        reportStatus: report.status
                    });
                }

                relatedReports.push(reportId);
                metadata.reportIds.push(reportId);

                reportContext = buildReportContext(report);

            } catch (error) {
                console.error('Error fetching report:', error);
                return res.status(500).json({
                    success: false,
                    message: "Error accessing report data",
                    error: error.message
                });
            }
        }

        let responseText = await generateChatbotResponse(
            message,
            messageUrgency,
            reportContext,
            messageContext,
            reportId && report ? report.analysisResult : null
        );

        const chatMessage = await ChatMessage.create({
            userId,
            message: message.trim(),
            response: responseText,
            urgency: messageUrgency,
            relatedReports,
            context: messageContext,
            metadata
        });

        await chatMessage.populate('relatedReports', 'fileName status createdAt');

        res.status(201).json({
            success: true,
            data: chatMessage
        });

    } catch (error) {
        console.error('Error in sendMessage:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format'
            });
        }

        next(error);
    }
};

 

export const getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);
        const { context, urgency, startDate, endDate } = req.query;

        // Build query
        const query = { userId };

        if (context && ['general', 'report_analysis', 'appointment', 'medical_query'].includes(context)) {
            query.context = context;
        }

        if (urgency && ['Low', 'Medium', 'High'].includes(urgency)) {
            query.urgency = urgency;
        }

        // Date range filter
        const dateQuery = validateDateRange(startDate, endDate);
        if (dateQuery) {
            query.timestamp = dateQuery;
        }

        // Execute query with optimization
        const [history, totalCount] = await Promise.all([
            ChatMessage.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('relatedReports', 'fileName status createdAt')
                .select('-__v')
                .lean(), // Use lean for better performance (read-only)
            ChatMessage.countDocuments(query)
        ]);

        // Calculate pagination metadata
        const pagination = getPaginationMetadata(totalCount, page, limit);

        res.status(200).json({
            success: true,
            data: history,
            pagination
        });

    } catch (error) {
        console.error('Error in getHistory:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters'
            });
        }

        next(error);
    }
};


 
export const getReportConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { reportId } = req.params;

        // Validate reportId
        if (!isValidObjectId(reportId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report ID format"
            });
        }

        // Verify report exists and belongs to user
        const report = await Report.findOne({
            _id: reportId,
            userId: userId
        }).select('fileName status').lean();

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        // Find all chat messages related to this report
        const conversations = await ChatMessage.find({
            userId,
            relatedReports: reportId
        })
            .sort({ timestamp: -1 })
            .select('-__v')
            .lean();

        res.status(200).json({
            success: true,
            report: {
                id: reportId,
                fileName: report.fileName,
                status: report.status
            },
            count: conversations.length,
            data: conversations
        });

    } catch (error) {
        console.error('Error in getReportConversations:', error);
        next(error);
    }
};

 
export const deleteMessage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { messageId } = req.params;

        // Validate messageId
        if (!isValidObjectId(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID format"
            });
        }

        const message = await ChatMessage.findOneAndDelete({
            _id: messageId,
            userId: userId
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found or already deleted"
            });
        }

        res.status(200).json({
            success: true,
            message: "Chat message deleted successfully"
        });

    } catch (error) {
        console.error('Error in deleteMessage:', error);
        next(error);
    }
};


/**
 * Build context string from report analysis
 */
function buildReportContext(report) {
    let context = `Report: ${report.fileName}\n`;

    if (report.analysisResult) {
        // The ML service saves these fields directly under analysisResult
        if (report.analysisResult.summary) {
            context += `Summary: ${report.analysisResult.summary}\n`;
        }
        if (report.analysisResult.severity) {
            context += `Severity: ${report.analysisResult.severity}\n`;
        }
        if (report.analysisResult.recommendedDoctor) {
            context += `Recommended Doctor: ${report.analysisResult.recommendedDoctor}\n`;
        }
        if (report.analysisResult.chatbotExplanation) {
            context += `Explanation: ${report.analysisResult.chatbotExplanation}\n`;
        }
        
        // Handle legacy format if any
        if (report.analysisResult.analysis) {
            context += `Analysis: ${report.analysisResult.analysis}\n`;
        }
    }

    if (report.extractedText) {
        // Limit extracted text to prevent context overflow
        const textPreview = report.extractedText.substring(0, 1000);
        context += `Extracted Text: ${textPreview}${report.extractedText.length > 1000 ? '...' : ''}\n`;
    }

    return context;
}

/**
 * Generate chatbot response based on message and context
 */
async function generateChatbotResponse(message, urgency, reportContext, context, reportAnalysisResult = null) {
    let responseText = '';

    if (reportAnalysisResult && (reportAnalysisResult.summary || reportAnalysisResult.features || reportAnalysisResult.analysis)) {
        try {
            const CHATBOT_URL = (process.env.CHATBOT_API_URL || '').replace(/\/$/, '');
            
            if (!CHATBOT_URL) {
                logger.warn('CHATBOT_API_URL not configured, skipping microservice call');
                throw new Error('Chatbot service not configured');
            }
            
            const analysisPayload = {
                predictions: {},
                severity: "Unknown",
                summary: "No summary available",
                ...reportAnalysisResult,
                features: {
                    raw_output: typeof reportAnalysisResult.features === 'object' 
                        ? JSON.stringify(reportAnalysisResult.features) 
                        : (reportAnalysisResult.summary || "Medical report features")
                }
            };

            const payload = {
                analysis: analysisPayload,
                question: message
            };

            logger.info(`Pinging chatbot ML microservice at ${CHATBOT_URL}`);
            logger.info('Chatbot payload: %o', payload);
            
            const response = await axios.post(CHATBOT_URL, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000 // Increased timeout to 60s for LLM processing
            });

            if (response.data && response.data.answer) {
                return response.data.answer;
            }
        } catch (error) {
            logger.error('Error pinging chatbot microservice: %s', error.message);
            if (error.response) {
                logger.error('Microservice response data: %o', error.response.data);
            }
            // Fallthrough to static response or general chatbot on error
        }
    } else {
        // Handle general chat via the mentioned endpoint if no report context
        try {
            const GENERAL_CHATBOT_URL = (process.env.CHATBOT_GENERAL_URL || '').replace(/\/$/, '');
            
            if (GENERAL_CHATBOT_URL) {
                const payload = {
                    question: message
                };

                logger.info(`Pinging general chatbot at ${GENERAL_CHATBOT_URL}`);
                
                const response = await axios.post(GENERAL_CHATBOT_URL, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000
                });

                if (response.data && response.data.answer) {
                    return response.data.answer;
                }
            }
        } catch (error) {
            logger.error('Error pinging general chatbot service: %s', error.message);
            if (error.response) {
                logger.error('General chatbot response data: %o', error.response.data);
            }
        }
    }

    if (urgency === 'High') {
        responseText = "This sounds urgent. If this is a medical emergency, please call emergency services immediately or visit the nearest hospital.\n\n";
    }

    if (reportContext) {
        responseText += `I've reviewed your report. Based on the information:\n\n`;
        responseText += `Your question: "${message}"\n\n`;
        responseText += `Report Context:\n${reportContext}\n\n`;
        responseText += `Please note: This is an AI assistant. For medical advice, always consult with your healthcare provider.`;
    } else {
        switch (context) {
            case 'appointment':
                responseText += `Regarding appointments: ${message}\n\nI can help you with appointment-related queries. `;
                break;
            case 'medical_query':
                responseText += `Medical Query: ${message}\n\nWhile I can provide general information, please consult a healthcare professional for medical advice. `;
                break;
            default:
                responseText += `I received your message: "${message}"\n\n`;
                responseText += `I'm here to help with your health-related questions. You can ask me about your reports, appointments, or general health information.`;
        }
    }

    return responseText;
}

function extractKeywords(message) {
    const commonWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'my', 'i', 'me', 'what', 'how', 'when', 'where', 'why'];

    const words = message.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));

    // Return unique keywords (max 10)
    return [...new Set(words)].slice(0, 10);
}