import React from 'react';
import { X, Calendar, Clock, User, FileText, IndianRupee, MapPin, Activity, Video } from 'lucide-react';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const AppointmentDetailsModal = ({ isOpen, onClose, appointment, isDoctor }) => {
    if (!isOpen || !appointment) return null;

    const person = isDoctor ? appointment.userId : appointment.doctorId;
    const personName = person?.name ? (typeof person.name === 'string' ? person.name : `${person.name.first} ${person.name.last}`) : (isDoctor ? 'Patient' : 'Doctor');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Appointment Details</h2>
                            <p className="text-gray-500 text-sm font-medium">Reference: {appointment._id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid gap-8">
                        {/* Profile Section */}
                        <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                            <Avatar
                                src={person?.avatarUrl || person?.image || person?.userId?.avatarUrl || person?.userId?.image}
                                alt={personName}
                                className="w-16 h-16 border-2 border-white shadow-sm"
                            />
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{isDoctor ? 'Patient Information' : 'Doctor Information'}</p>
                                <h3 className="text-lg font-bold text-gray-900">{personName}</h3>
                                <p className="text-sm text-blue-600 font-medium">{isDoctor ? 'Consultation' : (appointment.doctorId?.specialization || 'Generalist')}</p>
                            </div>
                        </div>

                        {/* Scheduling Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</p>
                                    <p className="text-sm font-bold text-gray-900">{appointment.time}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status and Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <p className="text-sm font-bold text-gray-900">{appointment.status}</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mode</p>
                                    <p className="text-sm font-bold text-gray-900">Video Consultation</p>
                                </div>
                            </div>
                        </div>

                        {/* Coming Soon Section for History */}
                        {isDoctor && (
                            <div
                                onClick={() => toast.success('Full Medical History - Coming Soon!')}
                                className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest">New Feature</span>
                                </div>
                                <h4 className="text-lg font-bold mb-1">Access Patient History</h4>
                                <p className="text-blue-100 text-sm opacity-90">View previous reports, prescriptions, and consultation notes.</p>
                                <div className="mt-4 flex items-center text-sm font-bold text-blue-200 group-hover:text-white transition-colors">
                                    Check Availability <FileText className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-2xl border border-gray-200 shadow-sm transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;
