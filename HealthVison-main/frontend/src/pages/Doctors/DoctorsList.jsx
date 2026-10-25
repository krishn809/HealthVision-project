import React, { useState, useEffect } from 'react';
import doctorService from '../../services/doctor.service';
import DoctorCard from '../../components/DoctorCard';
import { Search, Filter } from 'lucide-react';

export default function DoctorsList() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');

    // Derived from data
    const [specializations, setSpecializations] = useState([]);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await doctorService.getAllDoctors();
            if (response.success) {
                setDoctors(response.data);
                setFilteredDoctors(response.data);

                // Extract unique specializations
                const uniqueSpecs = [...new Set(response.data.map(doc => doc.specialization))].sort();
                setSpecializations(uniqueSpecs);
            }
        } catch (error) {
            console.error("Failed to load doctors", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = doctors;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(doc =>
                doc.name.toLowerCase().includes(lowerTerm) ||
                doc.specialization.toLowerCase().includes(lowerTerm)
            );
        }

        if (specializationFilter) {
            result = result.filter(doc => doc.specialization === specializationFilter);
        }

        setFilteredDoctors(result);
    }, [searchTerm, specializationFilter, doctors]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Doctor</h1>
                <p className="text-gray-600">Book appointments with the best doctors in your city</p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by doctor name or specialization..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:w-64 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white appearance-none cursor-pointer"
                            value={specializationFilter}
                            onChange={(e) => setSpecializationFilter(e.target.value)}
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 animate-pulse">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                                <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results */}
            {!loading && (
                <>
                    {filteredDoctors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredDoctors.map(doctor => (
                                <DoctorCard key={doctor._id} doctor={doctor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No doctors found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSpecializationFilter(''); }}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
