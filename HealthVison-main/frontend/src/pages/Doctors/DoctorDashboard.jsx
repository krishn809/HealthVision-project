import React, { useEffect, useState, useCallback } from 'react';
import { Users, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Search, Filter, MoreVertical, User, Activity, Video, IndianRupee } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import authService from '../../services/auth.service';
import dashboardService from '../../services/dashboard.service';
import appointmentService from '../../services/appointment.service';
import StatCard from '../../components/Dashboard/StatCard';
import AppointmentHistory from '../../components/Dashboard/AppointmentHistory';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [stats, setStats] = useState({
        appointments: { total: 0, pending: 0 },
        consultations: 0,
        reports: 0,
        isApproved: user?.isApproved
    });
    const [appointments, setAppointments] = useState([]);
    const [appointmentData, setAppointmentData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsRes, appointmentsRes] = await Promise.all([
                dashboardService.getStats(),
                appointmentService.getAppointments()
            ]);

            if (statsRes.success) {
                setStats(statsRes.data);
                
                // Update local storage if approval status changed on the server
                if (statsRes.data.isApproved !== user?.isApproved) {
                    const updatedUser = { ...user, isApproved: statsRes.data.isApproved };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }

            if (appointmentsRes.success) {
                const fetchedAppointments = appointmentsRes.data;
                setAppointments(fetchedAppointments);
                processChartData(fetchedAppointments);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const processChartData = (appointments) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(day => ({ name: day, appointments: 0 }));

        appointments.forEach(apt => {
            const date = new Date(apt.date);
            const dayIndex = date.getDay();
            if (!isNaN(dayIndex) && data[dayIndex]) {
                data[dayIndex].appointments += 1;
            }
        });

        const monSunData = [...data.slice(1), data[0]];
        setAppointmentData(monSunData);
    };

    const formattedAppointments = appointments
        .filter(apt => ['Scheduled', 'Confirmed', 'Pending'].includes(apt.status))
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA - dateB !== 0) return dateA - dateB;
            return a.time.localeCompare(b.time);
        })
        .map(apt => ({
            id: apt._id,
            patientName: apt.userId?.name ? (typeof apt.userId.name === 'string' ? apt.userId.name : `${apt.userId.name.first} ${apt.userId.name.last}`) : 'Unknown Patient',
            patientAvatar: apt.userId?.avatarUrl,
            date: new Date(apt.date).toLocaleDateString(),
            time: apt.time,
            status: apt.status
        }))
        .slice(0, 10);

    const statsCards = [
        {
            title: 'Assigned Appointments',
            value: stats.appointments.total.toString(),
            icon: Calendar,
            color: 'bg-blue-500',
            description: `${stats.appointments.pending} Pending`
        },
        {
            title: 'Patients Consulted',
            value: stats.consultations.toString(),
            icon: Users,
            color: 'bg-purple-500',
            description: 'Total completed'
        },
        {
            title: 'Upcoming Calls',
            value: formattedAppointments.length.toString(),
            icon: Video,
            color: 'bg-green-500',
            description: 'Scheduled'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={user?.avatarUrl}
                        alt={user?.name?.first || 'Doctor'}
                        className="w-16 h-16"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome back, Dr. {user?.name?.first || 'Doctor'}!
                        </h1>
                        <p className="text-gray-500 mt-1">Here is your clinical overview for today.</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {statsCards.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>

                        {!stats.isApproved && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
                                <div className="bg-amber-100 p-2 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="text-amber-900 font-bold">Profile Pending Approval</h4>
                                    <p className="text-amber-700 text-sm mt-1">
                                        Your profile is currently under review by our administrative team. 
                                        You can still set up your profile and explore the dashboard, 
                                        but patients will not be able to find you or book appointments until you are approved.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                Patient Load Trends
                            </h3>
                            <div className="h-64 w-full relative">
                                <ResponsiveContainer width="99%" height={250}>
                                    <BarChart data={appointmentData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#F3F4F6' }}
                                        />
                                        <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800">Assigned Appointments</h2>
                            </div>
                            <AppointmentHistory
                                appointments={formattedAppointments}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white text-center">
                            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ready for Consultation?</h3>
                            <p className="text-blue-100 text-sm mb-6">Join your next scheduled video call with your patient.</p>
                            <button
                                onClick={() => navigate('/appointments')}
                                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors w-full"
                            >
                                View Schedule
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => toast.success('Patient Records - Coming Soon!')}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center text-gray-700 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                        <Users className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium">Patient Records</span>
                                </button>
                                <button
                                    onClick={() => toast.success('Earning History - Coming Soon!')}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center text-gray-700 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                                        <IndianRupee className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Earning History</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
