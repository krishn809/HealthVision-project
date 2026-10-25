import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, AlertCircle, X, CheckCircle, RefreshCcw, Filter, ChevronRight, Wallet, Video } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import appointmentService from '../services/appointment.service';
import RescheduleModal from '../components/Appointment/RescheduleModal';
import AppointmentDetailsModal from '../components/Appointment/AppointmentDetailsModal';
import paymentService from '../services/payment.service';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const Appointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('Upcoming'); // Upcoming, Past, Cancelled, All
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [viewingAppointment, setViewingAppointment] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const user = authService.getCurrentUser();
    const isDoctor = user?.role === 'doctor';

    useEffect(() => {
        fetchAppointments();
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        if (isDoctor) return;
        try {
            const response = await paymentService.getWalletBalance();
            setWalletBalance(response.balance || 0);
        } catch (err) {
            console.error("Error fetching balance:", err);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await appointmentService.getAppointments();
            const data = response.data || (Array.isArray(response) ? response : []);

            // Sort chronologically (soonest or most recent first)
            const sortedData = Array.isArray(data) ? [...data].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (dateA - dateB !== 0) {
                    return filter === 'Past' ? dateB - dateA : dateA - dateB;
                }
                return filter === 'Past' ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time);
            }) : [];

            setAppointments(sortedData);
        } catch (err) {
            setError('Failed to load appointments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-600">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-bold text-gray-900">Cancel Appointment?</p>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                    Please note: 20% of the consultation fee will be deducted as cancellation charges.
                </p>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const response = await appointmentService.cancelAppointment(id);
                                toast.success(response?.message || "Appointment cancelled successfully");
                                fetchAppointments();
                                fetchBalance();
                            } catch (err) {
                                toast.error(err.response?.data?.message || "Failed to cancel appointment");
                                console.error(err);
                            }
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                        Confirm Cancellation
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                        Keep It
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                borderRadius: '20px',
                padding: '16px',
                border: '1px solid #fee2e2',
                maxWidth: '400px'
            }
        });
    };

    const handleRescheduleClick = (apt) => {
        setSelectedAppointment(apt);
        setIsRescheduleModalOpen(true);
    };

    const handleDetailsClick = (apt) => {
        setViewingAppointment(apt);
        setIsDetailsModalOpen(true);
    };

    const handleJoinConsultation = (apt) => {
        const roomId = apt.roomId || `room_${apt._id}`;
        navigate(`/consultation/${roomId}?appointmentId=${apt._id}`);
    };

    const filteredAppointments = useMemo(() => {
        const validAppointments = appointments.filter(a => a.status !== 'Pending');
        if (filter === 'All') return validAppointments;
        if (filter === 'Upcoming') return validAppointments.filter(a => ['Scheduled', 'Confirmed'].includes(a.status));
        if (filter === 'Past') return validAppointments.filter(a => a.status === 'Completed');
        if (filter === 'Cancelled') return validAppointments.filter(a => a.status === 'Cancelled');
        return validAppointments;
    }, [appointments, filter]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Scheduled':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-100',
                    icon: <Clock className="w-3.5 h-3.5" />
                };
            case 'Completed':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-100',
                    icon: <CheckCircle className="w-3.5 h-3.5" />
                };
            case 'Cancelled':
                return {
                    bg: 'bg-rose-50',
                    text: 'text-rose-700',
                    border: 'border-rose-100',
                    icon: <X className="w-3.5 h-3.5" />
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-100',
                    icon: <AlertCircle className="w-3.5 h-3.5" />
                };
        }
    };

    if (loading && appointments.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 font-primary tracking-tight">My Appointment History</h1>
                    <p className="text-gray-500 mt-1">Manage and track your healthcare consultations</p>
                </div>

                {/* Wallet Balance Chip - Hidden for doctors */}
                {!isDoctor && (
                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Your Balance</p>
                            <p className="text-lg font-black text-gray-900 leading-none">₹{walletBalance.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 flex items-center border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl mb-8 w-fit gap-1 border border-gray-200 shadow-inner">
                {['Upcoming', 'Past', 'Cancelled', 'All'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${filter === tab
                            ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5 scale-[1.02]'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No {filter.toLowerCase()} appointments</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                        {filter === 'Upcoming'
                            ? "You don't have any sessions scheduled right now."
                            : `No appointments found in the ${filter.toLowerCase()} category.`}
                    </p>
                    {filter === 'Upcoming' && (
                        <button
                            onClick={() => navigate('/appointments/book')}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all hover:shadow-xl active:scale-95"
                        >
                            Book Now
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-5">
                    {filteredAppointments.map((apt) => {
                        const style = getStatusStyles(apt.status);
                        return (
                            <div key={apt._id} className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
                                {/* Status Glow Effect */}
                                <div className={`absolute -left-4 top-0 bottom-0 w-1 ${style.bg} blur-sm group-hover:blur-md transition-all`}></div>

                                <div className="flex items-center gap-5 z-10">
                                    <div className="relative">
                                        <Avatar
                                            src={isDoctor ? (apt.userId?.avatarUrl || apt.userId?.image) : (apt.doctorId?.avatarUrl || apt.doctorId?.image || apt.doctorId?.userId?.avatarUrl || apt.doctorId?.userId?.image)}
                                            alt={isDoctor ? "Patient" : "Doctor"}
                                            className="w-14 h-14 border border-white"
                                            iconSize="w-7 h-7"
                                        />
                                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-white shadow-sm ${style.bg} ${style.text}`}>
                                            {style.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors leading-tight">
                                            {isDoctor
                                                ? (apt.userId?.name ? `${apt.userId.name.first} ${apt.userId.name.last}` : 'Unknown Patient')
                                                : (apt.doctorId?.name || 'Unknown Doctor')}
                                        </h3>
                                        <p className="text-blue-600 text-sm font-bold tracking-wide uppercase opacity-80 decoration-slice">
                                            {isDoctor ? 'Patient Consultation' : (apt.doctorId?.specialization || 'General')}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <Calendar className="w-4 h-4 text-blue-500/70" />
                                                {apt.date ? new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                <Clock className="w-4 h-4 text-blue-500/70" />
                                                {apt.time || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto z-10">
                                    <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold border ${style.bg} ${style.text} ${style.border} shadow-sm uppercase tracking-wider`}>
                                        {apt.status}
                                    </span>

                                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                        {/* Primary Actions for Scheduled/Confirmed/Pending */}
                                        {(apt.status === 'Scheduled' || apt.status === 'Confirmed' || apt.status === 'Pending') && (
                                            <>
                                                <button
                                                    onClick={() => handleJoinConsultation(apt)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 shadow-md shadow-blue-100 ring-2 ring-blue-500/10 group/call"
                                                    title="Start Video Call"
                                                >
                                                    <Video className="w-4 h-4 group-hover/call:scale-110 transition-transform" />
                                                    <span className="hidden sm:inline">Join Call</span>
                                                </button>
                                                {!isDoctor && (
                                                    <button
                                                        onClick={() => handleRescheduleClick(apt)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white rounded-xl text-sm font-bold border border-gray-100 transition-all duration-200 active:scale-95 shadow-sm"
                                                        title="Reschedule"
                                                    >
                                                        <RefreshCcw className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Reschedule</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleCancel(apt._id)}
                                                    className="p-2 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl border border-gray-100 transition-all active:scale-95 shadow-sm"
                                                    title="Cancel Appointment"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}

                                        {/* Always show Details for any status */}
                                        <button
                                            onClick={() => handleDetailsClick(apt)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border border-gray-100 transition-all group/btn"
                                        >
                                            Details
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <RescheduleModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                appointment={selectedAppointment}
                onRescheduled={fetchAppointments}
            />

            <AppointmentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                appointment={viewingAppointment}
                isDoctor={isDoctor}
            />
        </div>
    );
};

export default Appointments;
