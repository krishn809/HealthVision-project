import api from './api';

class AdminService {
    async getPendingDoctors() {
        try {
            const response = await api.get('/doctors/admin/pending');
            return response.data;
        } catch (error) {
            console.error("Error fetching pending doctors:", error);
            throw error;
        }
    }

    async approveDoctor(id) {
        try {
            const response = await api.put(`/doctors/admin/approve/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error approving doctor:", error);
            throw error;
        }
    }

    async adminCreateDoctor(userData, doctorData) {
        try {
            const response = await api.post('/doctors/admin/create', { userData, doctorData });
            return response.data;
        } catch (error) {
            console.error("Error creating doctor profile:", error);
            throw error;
        }
    }
}

export default new AdminService();
