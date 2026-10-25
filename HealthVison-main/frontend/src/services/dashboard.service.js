import api from './api';

const getStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

const dashboardService = {
    getStats,
};

export default dashboardService;
