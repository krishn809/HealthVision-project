import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
    message = "Something went wrong. Please try again later.",
    onRetry,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h3>
            <p className="text-gray-600 mb-6 max-w-xs mx-auto">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm active:scale-95"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorState;
