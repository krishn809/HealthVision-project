import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Calendar, ShieldCheck, Phone } from 'lucide-react';
import doctorService from '../../services/doctor.service';
import appointmentService from '../../services/appointment.service';

export default function DoctorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeslots, setTimeslots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                const response = await doctorService.getDoctorById(id);
                if (response.success) {
                    setDoctor(response.data);
                } else {
                    setError("Doctor not found");
                }
            } catch (err) {
                setError("Failed to load doctor details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDoctor();
        }
    }, [id]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!id) return;
            try {
                setSlotsLoading(true);
                const today = new Date().toISOString().split('T')[0];
                const res = await appointmentService.getTimeslots(id, today);
                // Limit to first 4 slots for preview
                setTimeslots((res.data || []).slice(0, 4));
            } catch (err) {
                console.error("Failed to fetch slots", err);
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSlots();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !doctor) return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Doctor not found"}</h2>
            <Link to="/doctors" className="text-blue-600 hover:underline">Back to Doctor List</Link>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            <Link to="/doctors" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Doctors
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Essential Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {(doctor.avatarUrl || doctor.image) ? (
                                <img
                                    src={doctor.avatarUrl || doctor.image}
                                    alt={doctor.name}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover flex-shrink-0 shadow-sm border border-gray-100"
                                />
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-blue-600 text-5xl md:text-6xl font-bold">{doctor.name.charAt(0)}</span>
                                </div>
                            )}

                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                                        <p className="text-lg text-blue-600 font-medium mb-1">{doctor.specialization}</p>
                                        <p className="text-sm text-gray-500 mb-3">{doctor.qualifications}</p>

                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="flex items-center bg-yellow-50 px-2.5 py-1 rounded-lg text-yellow-700 font-bold text-sm">
                                                <Star className="w-4 h-4 mr-1 fill-current" />
                                                {doctor.rating}
                                            </div>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-600 text-sm">{doctor.experience} years experience</span>
                                            {doctor.isReal ? (
                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200 flex items-center gap-1">
                                                    <span>✓</span> Verified Doctor
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 flex items-center gap-1">
                                                    <span>🧪</span> Demo Profile
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm text-gray-500 mb-1">Consultation Fee</p>
                                        <p className="text-2xl font-bold text-gray-900">₹{doctor.fee}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {doctor.languages && doctor.languages.map(lang => (
                                        <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Location</h3>
                                    <p className="text-sm text-gray-600">{doctor.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <ShieldCheck className="w-5 h-5 text-blue-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Registration</h3>
                                    <p className="text-sm text-gray-600">{doctor.registration}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-blue-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Contact</h3>
                                    <p className="text-sm text-gray-600">{doctor.contact}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About Doctor</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {doctor.about}
                        </p>
                    </div>
                </div>

                {/* Right Column: Booking Card */}
                <div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <div className="md:hidden flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Consultation Fee</p>
                                <p className="text-2xl font-bold text-gray-900">₹{doctor.fee}</p>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Available Slots
                        </h3>

                        <div className="space-y-2 mb-6">
                            {slotsLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : timeslots.length > 0 ? (
                                <>
                                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Available Today</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {timeslots.map((slot, index) => (
                                            <div key={index} className={`p-2 border rounded-lg text-sm text-center ${slot.isAvailable ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                {slot.time}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 italic text-center">Click book to see full schedule</p>
                                </>
                            ) : (
                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 text-center">
                                    No slots available for today
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/appointments/book', { state: { doctor } })}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                        >
                            Book Appointment
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-4">
                            Inclusive of all taxes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
