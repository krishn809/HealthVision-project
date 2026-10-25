import api from './api';

const getAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

const getAppointmentById = async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
};

const appointmentService = {
    getAppointments,
    getAppointmentById,

    getTimeslots: async (doctorId, date) => {
        const response = await api.get(`/appointments/timeslots/${doctorId}?date=${date}`);
        return response.data;
    },

    bookAppointment: async (bookingData) => {
        const response = await api.post('/appointments', bookingData);
        return response.data;
    },

    cancelAppointment: async (id) => {
        const response = await api.put(`/appointments/${id}/cancel`, {});
        return response.data;
    },

    rescheduleAppointment: async (id, rescheduleData) => {
        const response = await api.put(`/appointments/${id}/reschedule`, rescheduleData);
        return response.data;
    }
};

export default appointmentService;
