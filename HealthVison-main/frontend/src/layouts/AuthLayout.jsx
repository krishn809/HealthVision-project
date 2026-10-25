import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center items-center gap-3">
                    <img src="/logo.png" alt="HealthVision Logo" className="h-24 w-24" />
                    <h2 className="text-center text-3xl font-bold text-gray-900 tracking-tight">
                        HealthVision
                    </h2>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-indigo-100/20 sm:rounded-lg sm:px-10 border border-gray-100">
                    <Outlet />
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} HealthVision. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
