import api from './api';

const getCurrentUser = async () => {
    try {
        const response = await api.get('/user/me');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/user/profile', profileData);
        if (response.data.user) {
            // Update local storage user data
            const localUser = JSON.parse(localStorage.getItem('user'));
            if (localUser) {
                const updatedUser = {
                    ...localUser,
                    ...response.data.user
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

const userService = {
    getCurrentUser,
    updateProfile
};

export default userService;
