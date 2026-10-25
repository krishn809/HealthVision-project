import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, Home, AlertCircle } from 'lucide-react';

const PaymentFailure = () => {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (!location.state?.fromPayment) {
            navigate('/dashboard', { replace: true });
        }
    }, [location.state, navigate]);

    if (!location.state?.fromPayment) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-400 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-red-500 to-pink-500 flex items-center justify-center text-white shadow-xl">
                    <XCircle className="w-12 h-12" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Payment Failed</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                We're sorry, but we couldn't process your payment. This could be due to a technical issue or insufficient funds.
            </p>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-10 w-full max-w-sm flex items-start gap-4 text-left">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-red-900">Possible Reason</h3>
                    <p className="text-sm text-red-700">The bank rejected the transaction or the session timed out. Please try again.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate('/appointments/book')}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
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

export default PaymentFailure;
