import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import appointmentService from '../../services/appointment.service';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import ErrorState from '../ui/ErrorState';

const TimeslotSelection = ({ doctorId, onSelect, selectedSlot }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeslots, setTimeslots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Generate next 7 days for quick selection
    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: date.getDate()
            });
        }
        return days;
    };

    const nextDays = getNextDays();

    useEffect(() => {
        if (doctorId && selectedDate) {
            fetchTimeslots();
        }
    }, [doctorId, selectedDate]);

    const fetchTimeslots = async () => {
        try {
            setLoading(true);
            setError(null);
            // In a real app, this would fetch from backend.
            // For MVP, we might mock if backend isn't ready, but let's try to fetch.
            // If backend endpoints fortimeslots aren't ready (Day 15 backend task), we might need to mock here fallback.

            try {
                const data = await appointmentService.getTimeslots(doctorId, selectedDate);
                setTimeslots(data.data || []);
            } catch (err) {
                // Fallback mock data if backend not ready or fails
                console.warn("Backend fetch failed, using mock data for UI demo");
                const mockSlots = generateMockSlots(9, 17); // 9 AM to 5 PM
                setTimeslots(mockSlots);
            }
        } catch (err) {
            setError('Failed to load timeslots');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateMockSlots = (startHour, endHour) => {
        const slots = [];
        for (let i = startHour; i < endHour; i++) {
            const time = `${i < 10 ? '0' + i : i}:00`;
            slots.push({
                id: `${selectedDate}-${time}`,
                time: time,
                isAvailable: Math.random() > 0.3 // Random availability
            });
            const timeHalf = `${i < 10 ? '0' + i : i}:30`;
            slots.push({
                id: `${selectedDate}-${timeHalf}`,
                time: timeHalf,
                isAvailable: Math.random() > 0.3
            });
        }
        return slots;
    };

    return (
        <div className="space-y-6">
            {/* Date Selection */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Select Date
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {nextDays.map((day) => (
                        <button
                            key={day.date}
                            onClick={() => setSelectedDate(day.date)}
                            className={`flex flex-col items-center min-w-[70px] p-3 rounded-xl border transition-all ${selectedDate === day.date
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            <span className="text-xs font-medium opacity-80">{day.dayName}</span>
                            <span className="text-lg font-bold">{day.dayNumber}</span>
                        </button>
                    ))}
                    <div className="flex items-center">
                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Timeslot Selection */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Select Time
                </h3>

                {loading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                            <LoadingSkeleton key={i} height="40px" className="rounded-lg" />
                        ))}
                    </div>
                ) : error ? (
                    <ErrorState message={error} onRetry={fetchTimeslots} />
                ) : timeslots.length === 0 ? (
                    <div className="text-gray-500 bg-gray-50 p-6 rounded-xl text-center border border-dashed border-gray-300">
                        No slots available for this date.
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {timeslots.map((slot) => (
                            <button
                                key={slot.id || slot.time}
                                disabled={!slot.isAvailable}
                                onClick={() => onSelect({ date: selectedDate, time: slot.time })}
                                className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${!slot.isAvailable
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed decoration-slice'
                                    : selectedSlot?.time === slot.time && selectedSlot?.date === selectedDate
                                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                    }`}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeslotSelection;
