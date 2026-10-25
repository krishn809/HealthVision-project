import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../services/auth.service';

export default function DoctorCard({ doctor }) {
    const navigate = useNavigate();

    const handleViewProfile = () => {
        const user = authService.getCurrentUser();
        if (!user) {
            toast('Please login to view doctor profiles and book appointments!', { icon: '👋', duration: 3000 });
            setTimeout(() => navigate('/login'), 800);
        } else {
            navigate(`/doctors/${doctor._id}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        {(doctor.avatarUrl || doctor.image) ? (
                            <img
                                src={doctor.avatarUrl || doctor.image}
                                alt={doctor.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {doctor.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{doctor.name}</h3>
                            <p className="text-blue-600 font-medium text-sm">{doctor.specialization}</p>
                            {/* Optional: Show qualification if needed but might clutter card */}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-xs font-bold">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {doctor.rating}
                        </div>
                        {doctor.isReal ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
                                ✓ Verified
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full border border-amber-200">
                                Demo
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{doctor.experience} years experience</span>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="line-clamp-1">{doctor.location || 'Kanpur, India'}</span>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm">
                        <span className="font-semibold text-gray-900 mr-2">₹{doctor.fee}</span>
                        <span>Consultation Fee</span>
                    </div>
                </div>

                <button
                    onClick={handleViewProfile}
                    className="block w-full text-center py-2.5 px-4 bg-gray-50 hover:bg-blue-600 text-blue-600 hover:text-white font-medium rounded-lg transition-colors duration-300 border border-blue-200 hover:border-blue-600"
                >
                    View Profile
                </button>
            </div>
        </div>
    );
}
