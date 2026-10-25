import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import Avatar from '../ui/Avatar';

const AppointmentHistory = ({ appointments, onReschedule, onCancel }) => {
    const navigate = useNavigate();
    const userRole = authService.getCurrentUser()?.role;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled':
            case 'Confirmed': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Scheduled':
            case 'Confirmed': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'Pending': return <AlertCircle className="w-4 h-4 mr-1" />;
            case 'Cancelled': return <XCircle className="w-4 h-4 mr-1" />;
            case 'Completed': return <CheckCircle className="w-4 h-4 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Upcoming Appointments</h3>
                <Link to="/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
            </div>

            <div className="block md:hidden">
                {appointments && appointments.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {appointments.map((apt) => (
                            <div key={apt._id || apt.id} className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <Avatar 
                                            src={userRole === 'doctor' ? apt.patientAvatar : apt.doctorAvatar}
                                            alt={userRole === 'doctor' ? apt.patientName : apt.doctorName}
                                            className="h-10 w-10"
                                        />
                                        <div className="ml-3">
                                            <div className="text-sm font-bold text-gray-900">
                                                {userRole === 'doctor' ? (apt.patientName || 'Patient') : (apt.doctorName || 'Doctor')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {userRole === 'doctor' ? 'Consultation' : (apt.specialization || 'General')}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 inline-flex items-center text-[10px] font-bold rounded-full ${getStatusColor(apt.status)}`}>
                                        {apt.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
                                        {apt.date}
                                    </div>
                                    <div className="flex items-center border-l border-gray-200 pl-4">
                                        <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                                        {apt.time}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(apt.status === 'Scheduled' || apt.status === 'Confirmed' || apt.status === 'Pending') && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/consultation/${apt.id || apt._id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform"
                                            >
                                                <Video className="w-4 h-4" />
                                                Join Call
                                            </button>
                                            {userRole !== 'doctor' && (
                                                <button
                                                    onClick={() => onCancel && onCancel(apt.id || apt._id)}
                                                    className="px-4 py-2.5 text-red-600 border border-red-100 rounded-xl text-sm font-bold active:bg-red-50"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 text-sm italic">
                        No upcoming appointments.
                    </div>
                )}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {userRole === 'doctor' ? 'Patient' : 'Doctor'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments && appointments.length > 0 ? (
                            appointments.map((apt) => (
                                <tr key={apt._id || apt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <Avatar 
                                                src={userRole === 'doctor' ? apt.patientAvatar : apt.doctorAvatar}
                                                alt={userRole === 'doctor' ? apt.patientName : apt.doctorName}
                                                className="h-8 w-8"
                                                iconSize="w-4 h-4"
                                            />
                                            <div className="ml-4">
                                                <div className="font-bold text-gray-900 leading-tight">
                                                    {userRole === 'doctor' ? (apt.patientName || 'Patient') : (apt.doctorName || 'Doctor')}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    {userRole === 'doctor' ? 'Consultation' : (apt.specialization || 'General')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            <div className="flex items-center font-medium">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                                {apt.date}
                                            </div>
                                            <div className="flex items-center text-gray-400 mt-1 text-xs">
                                                <Clock className="w-3.5 h-3.5 mr-2" />
                                                {apt.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex items-center text-[10px] uppercase tracking-wider font-bold rounded-full ${getStatusColor(apt.status)} shadow-sm`}>
                                            {getStatusIcon(apt.status)}
                                            {apt.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {(apt.status === 'Scheduled' || apt.status === 'Confirmed' || apt.status === 'Pending') ? (
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => navigate(`/consultation/${apt.id || apt._id}`)}
                                                    className="flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all hover:scale-105 active:scale-95 font-bold"
                                                >
                                                    <Video className="w-4 h-4 mr-1.5" />
                                                    Join
                                                </button>
                                                {userRole !== 'doctor' && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => onReschedule && onReschedule(apt)}
                                                            className="text-gray-400 hover:text-gray-900 transition-colors"
                                                            title="Reschedule"
                                                            aria-label={`Reschedule appointment with ${userRole === 'doctor' ? apt.patientName : apt.doctorName}`}
                                                        >
                                                            <Calendar className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onCancel && onCancel(apt.id || apt._id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Cancel"
                                                            aria-label={`Cancel appointment with ${userRole === 'doctor' ? apt.patientName : apt.doctorName}`}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs font-normal">Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic text-sm">
                                    No appointments scheduled yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentHistory;
