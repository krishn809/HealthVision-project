import api from './api';
import { getCurrentUser, isTokenExpired, logout } from '../utils/jwt.utils';

const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        if (response.data.token) {
            // Flatten the structure: { token, ...userProfile }
            const userData = {
                token: response.data.token,
                ...response.data.user
            };
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            const userDataToSave = {
                token: response.data.token,
                ...response.data.user
            };
            localStorage.setItem('user', JSON.stringify(userDataToSave));
            return userDataToSave;
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const resetPassword = async (token, password) => {
    try {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const sendOtp = async () => {
    try {
        const response = await api.post('/auth/send-otp');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const verifyOtp = async (otp) => {
    try {
        const response = await api.post('/auth/verify-otp', { otp });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const authService = {
    login,
    register,
    logout,
    getCurrentUser,
    isTokenExpired,
    forgotPassword,
    resetPassword,
    sendOtp,
    verifyOtp,
};

export default authService;
