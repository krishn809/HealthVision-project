import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

import { getCurrentUser, isTokenExpired, logout } from '../utils/jwt.utils';

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const user = getCurrentUser();
        if (user && user.token) {
            if (isTokenExpired(user.token)) {
                logout();
                toast.error("Session expired. Please login again.", { id: 'session-expired' });
                window.location.href = '/login';
                return Promise.reject(new Error("Token expired"));
            }
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if it's a login attempt, if so don't logout
            const isLoginRequest = error.config.url.includes('/auth/login');

            if (!isLoginRequest) {
                // Clear local storage and redirect to login
                localStorage.removeItem('user');

                // Show toast only once
                toast.error("Session expired. Please login again.", { id: 'session-expired' });

                // Redirect to login page
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
