import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Home, ArrowRight, AlertCircle } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (!location.state?.fromPayment) {
            navigate('/dashboard', { replace: true });
        }
    }, [location.state, navigate]);

    if (!location.state?.fromPayment) {
        return null; // Or a loading spinner while redirecting
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white shadow-xl">
                    <CheckCircle className="w-12 h-12" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                Thank you for choosing HealthVision. Your consultation has been scheduled and your specialist has been notified.
            </p>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-10 w-full max-w-sm">
                <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">Status</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Paid & Confirmed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="text-gray-900 font-semibold text-right">Online Specialist Consultation</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate('/appointments')}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                    <Calendar className="w-5 h-5" />
                    My Appointments
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all hover:-translate-y-1 active:scale-95"
                >
                    <Home className="w-5 h-5" />
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
