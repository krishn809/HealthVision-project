import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

/**
 * Extract text from a medical report using ML API
 * @param {string} filePath - Path to the uploaded file
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<Object>} - Extracted text and metadata
 */
export const extractTextFromReport = async (filePath, fileType) => {
    try {
        // Check if ML API URL is configured
        if (!process.env.ML_API_URL) {
            console.warn('ML_API_URL not configured. Skipping text extraction.');
            return {
                success: false,
                message: 'ML API not configured',
                extractedText: null
            };
        }

        const FormData = (await import('form-data')).default;

        // Fetch the file stream from the remote URL
        const fileStreamResponse = await axios.get(filePath, { responseType: 'stream' });

        const formData = new FormData();
        // Append the stream with filename and type so the ML API treats it as a file upload
        formData.append('file', fileStreamResponse.data, {
            filename: filePath.split('/').pop() || 'document',
            contentType: fileType
        });
        formData.append('fileType', fileType);

        const response = await axios.post(`${ML_API_URL}/api/ml/extract-text`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000 // 30 second timeout
        });

        return {
            success: true,
            extractedText: response.data.extractedText,
            metadata: response.data.metadata || {}
        };
    } catch (error) {
        console.error('Error extracting text from ML API:', error.message);
        
        // Return graceful degradation response
        return {
            success: false,
            message: error.response?.data?.message || 'ML API unavailable',
            extractedText: null,
            error: error.message
        };
    }
};

/**
 * Analyze medical report text using ML API
 * @param {string} extractedText - Text extracted from the report
 * @param {Object} metadata - Additional metadata about the report
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeReportText = async (extractedText, metadata = {}) => {
    try {
        // Check if ML API URL is configured
        if (!process.env.ML_API_URL) {
            console.warn('ML_API_URL not configured. Skipping analysis.');
            return {
                success: false,
                message: 'ML API not configured',
                analysis: null
            };
        }

        if (!extractedText) {
            return {
                success: false,
                message: 'No text provided for analysis',
                analysis: null
            };
        }

        const response = await axios.post(`${ML_API_URL}/api/ml/analyze`, {
            text: extractedText,
            metadata: metadata
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 60000 // 60 second timeout for analysis
        });

        return {
            success: true,
            analysis: response.data.analysis,
            insights: response.data.insights || [],
            recommendations: response.data.recommendations || []
        };
    } catch (error) {
        console.error('Error analyzing report with ML API:', error.message);
        
        // Return graceful degradation response
        return {
            success: false,
            message: error.response?.data?.message || 'ML API unavailable',
            analysis: null,
            error: error.message
        };
    }
};

/**
 * Analyze report using deployed ML microservice
 * @param {string} reportId - ID of the report to analyze
 * @returns {Promise<Object>} - Status response
 */
export const analyzeReport = async (reportId) => {
    try {
        const ML_ANALYSIS_URL = (process.env.ML_ANALYSIS_URL || '').replace(/\/$/, '');
        
        if (!ML_ANALYSIS_URL) {
            logger.warn('ML_ANALYSIS_URL not configured');
            return { success: false, message: 'ML Analysis service not configured' };
        }
        
        const payload = { report_id: reportId.toString() };
        logger.info(`Sending analysis request to ${ML_ANALYSIS_URL} with payload: %o`, payload);
        
        const response = await axios.post(
            ML_ANALYSIS_URL, 
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 120000 
            }
        );

        logger.info(`ML Analysis Response from ${ML_ANALYSIS_URL}: %o`, response.data);


        return {
            success: true,
            message: response.data.message || 'Analysis completed successfully',
            analysis: response.data.analysis, // This is the nested object from ref.txt
            mlApiAvailable: true
        };
    } catch (error) {
        logger.error('Error in complete report analysis: %s', error.message);
        if (error.response) {
            logger.error('ML Service Error Response: %d %o', error.response.status, error.response.data);
        } else if (error.request) {
            logger.error('ML Service No Response Received: %o', error.request);
        }
        
        return {
            success: false,
            message: error.response?.data?.detail || error.response?.data?.message || 'Error during report analysis',
            mlApiAvailable: error.code !== 'ECONNREFUSED' && error.code !== 'ENOTFOUND',
            error: error.message
        };
    }
};
