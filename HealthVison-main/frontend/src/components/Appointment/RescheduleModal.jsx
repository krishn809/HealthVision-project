import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import TimeslotSelection from './TimeslotSelection';
import appointmentService from '../../services/appointment.service';
import toast from 'react-hot-toast';

const RescheduleModal = ({ isOpen, onClose, appointment, onRescheduled }) => {
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !appointment) return null;

    const handleReschedule = async () => {
        if (!selectedSlot) {
            toast.error("Please select a new date and time");
            return;
        }

        try {
            setLoading(true);
            await appointmentService.rescheduleAppointment(appointment._id, {
                date: selectedSlot.date,
                time: selectedSlot.time
            });
            toast.success("Appointment rescheduled successfully");
            onRescheduled();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reschedule appointment");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Reschedule Appointment</h2>
                        <p className="text-gray-500 text-sm">Update your consultation with {appointment.doctorId?.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Current Appointment</p>
                            <p className="text-sm text-blue-600">
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                        </div>
                    </div>

                    <TimeslotSelection
                        doctorId={appointment.doctorId?._id}
                        onSelect={setSelectedSlot}
                        selectedSlot={selectedSlot}
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReschedule}
                        disabled={!selectedSlot || loading}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Rescheduling...
                            </>
                        ) : (
                            'Confirm Reschedule'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RescheduleModal;
