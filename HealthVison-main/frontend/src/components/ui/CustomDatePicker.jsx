import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDatePicker = ({ value, onChange, id }) => {
    // value is expected to be 'YYYY-MM-DD' or ISO string
    const initialDate = useMemo(() => {
        if (!value) return { day: '', month: '', year: '' };
        const date = new Date(value);
        if (isNaN(date.getTime())) return { day: '', month: '', year: '' };
        return {
            day: date.getDate().toString(),
            month: (date.getMonth() + 1).toString(),
            year: date.getFullYear().toString()
        };
    }, [value]);

    const [date, setDate] = useState(initialDate);

    useEffect(() => {
        setDate(initialDate);
    }, [initialDate]);

    const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);
    const months = useMemo(() => [
        { name: 'January', value: '1' },
        { name: 'February', value: '2' },
        { name: 'March', value: '3' },
        { name: 'April', value: '4' },
        { name: 'May', value: '5' },
        { name: 'June', value: '6' },
        { name: 'July', value: '7' },
        { name: 'August', value: '8' },
        { name: 'September', value: '9' },
        { name: 'October', value: '10' },
        { name: 'November', value: '11' },
        { name: 'December', value: '12' }
    ], []);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = 1900;
        return Array.from({ length: currentYear - startYear + 1 }, (_, i) => (currentYear - i).toString());
    }, []);

    const handlePartChange = useCallback((part, val) => {
        const newDate = { ...date, [part]: val };
        setDate(newDate);

        if (newDate.day && newDate.month && newDate.year) {
            // Create a valid date string
            const pad = (n) => n.padStart(2, '0');
            const dateStr = `${newDate.year}-${pad(newDate.month)}-${pad(newDate.day)}`;
            
            // Check if date is valid (e.g., handles Feb 30)
            const d = new Date(dateStr);
            if (!isNaN(d.getTime()) && d.getDate() === parseInt(newDate.day)) {
                onChange({ target: { id, value: dateStr } });
            }
        }
    }, [date, onChange, id]);

    return (
        <div className="flex gap-2">
            <div className="flex-1 min-w-[70px]">
                <select
                    value={date.day}
                    onChange={(e) => handlePartChange('day', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-shadow appearance-none cursor-pointer"
                >
                    <option value="">Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="flex-[2] min-w-[120px]">
                <select
                    value={date.month}
                    onChange={(e) => handlePartChange('month', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-shadow appearance-none cursor-pointer"
                >
                    <option value="">Month</option>
                    {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </select>
            </div>
            <div className="flex-[1.5] min-w-[90px]">
                <select
                    value={date.year}
                    onChange={(e) => handlePartChange('year', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-shadow appearance-none cursor-pointer"
                >
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
    );
};

export default CustomDatePicker;
