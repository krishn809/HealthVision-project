import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, description }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">{title}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{value}</h3>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0 ml-3`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
            </div>
            {description && (
                <p className="text-[10px] sm:text-sm text-gray-400 mt-3 sm:mt-4 truncate">{description}</p>
            )}
        </div>
    );
};

export default StatCard;
