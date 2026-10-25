import React, { useState, useEffect } from 'react';
import doctorService from '../../services/doctor.service';
import { User, Star, MapPin, Clock } from 'lucide-react';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import ErrorState from '../ui/ErrorState';
import Avatar from '../ui/Avatar';

const DoctorSelection = ({ onSelect, selectedDoctorId }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await doctorService.getAllDoctors();
            setDoctors(data.data || []); // Adjust based on API response structure
        } catch (err) {
            setError('Failed to load doctors. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 flex gap-4">
                        <LoadingSkeleton variant="circular" width="64px" height="64px" />
                        <div className="flex-1 space-y-2">
                            <LoadingSkeleton variant="text" width="60%" />
                            <LoadingSkeleton variant="text" width="40%" />
                            <div className="flex gap-2">
                                <LoadingSkeleton width="30%" height="16px" />
                                <LoadingSkeleton width="30%" height="16px" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchDoctors} />;
    }

    if (doctors.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                <p>No doctors available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
                <div
                    key={doctor._id}
                    onClick={() => onSelect(doctor)}
                    className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${selectedDoctorId === doctor._id
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-2'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <Avatar
                            src={doctor.avatarUrl || doctor.image || doctor.userId?.avatarUrl || doctor.userId?.image}
                            alt={doctor.name}
                            className="w-16 h-16"
                            iconSize="w-8 h-8"
                        />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                            <p className="text-sm text-blue-600 font-medium mb-1">{doctor.specialization}</p>

                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span>{doctor.rating} ({doctor.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{doctor.experience} yrs exp</span>
                                </div>
                            </div>

                            <div className="mt-3 flex justify-between items-center">
                                <span className="font-bold text-gray-900">₹{doctor.fee || doctor.fees || 500}</span>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Available</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DoctorSelection;
