import api from './api';

const paymentService = {
    createPayment: async (amount, appointmentId, walletAmount = 0) => {
        const response = await api.post('/payment/create', {
            amount,
            appointmentId,
            walletAmount
        });
        return response.data;
    },

    verifyPayment: async (paymentData) => {
        const response = await api.post('/payment/verify', paymentData);
        return response.data;
    },

    getPaymentHistory: async () => {
        const response = await api.get('/payment/history');
        return response.data;
    },

    getWalletBalance: async () => {
        const response = await api.get('/payment/balance');
        return response.data;
    },

    walletPayment: async (amount, appointmentId) => {
        const response = await api.post('/payment/wallet-payment', {
            amount,
            appointmentId
        });
        return response.data;
    }
};

export default paymentService;
