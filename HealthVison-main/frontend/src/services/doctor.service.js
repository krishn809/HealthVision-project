import api from './api';

class DoctorService {
    async getAllDoctors() {
        try {
            const response = await api.get('/doctors');
            return response.data;
        } catch (error) {
            console.error("Error fetching doctors:", error);
            throw error;
        }
    }

    async getDoctorById(id) {
        try {
            const response = await api.get(`/doctors/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching doctor with id ${id}:`, error);
            throw error;
        }
    }

    async getMyProfile() {
        try {
            const response = await api.get('/doctors/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching my doctor profile:", error);
            throw error;
        }
    }

    async updateMyProfile(profileData) {
        try {
            const response = await api.put('/doctors/me', profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating doctor profile:", error);
            throw error;
        }
    }
}

export default new DoctorService();
