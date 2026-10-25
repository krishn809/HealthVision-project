import api from './api';

/**
 * Upload a medical report file
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for upload progress
 * @returns {Promise} - Upload response
 */
const uploadReport = async (file, onProgress) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/reports/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });

        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

/**
 * Get all reports for the authenticated user
 * @returns {Promise} - List of reports
 */
const getUserReports = async () => {
    try {
        const response = await api.get('/reports');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

/**
 * Get a specific report by ID
 * @param {string} id - Report ID
 * @returns {Promise} - Report details
 */
const getReportById = async (id) => {
    try {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

/**
 * Delete a report
 * @param {string} id - Report ID
 * @returns {Promise} - Delete confirmation
 */
const deleteReport = async (id) => {
    try {
        const response = await api.delete(`/reports/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

/**
 * Analyze a report using ML API
 * @param {string} reportId - Report ID to analyze
 * @returns {Promise} - Analysis results
 */
const analyzeReport = async (reportId) => {
    try {
        const response = await api.post('/reports/analyze', { reportId });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const reportService = {
    uploadReport,
    getUserReports,
    getReportById,
    deleteReport,
    analyzeReport,
};

export default reportService;
