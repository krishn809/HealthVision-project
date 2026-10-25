import api from './api';

const sendMessage = async (message, urgency, reportId = null, context = 'general') => {
    const payload = { message, urgency, context };
    if (reportId) {
        payload.reportId = reportId;
    }

    const response = await api.post('/chatbot/message', payload);
    return response.data;
};

const getHistory = async () => {
    const response = await api.get('/chatbot/history');
    return response.data;
};

const chatbotService = {
    sendMessage,
    getHistory
};

export default chatbotService;
