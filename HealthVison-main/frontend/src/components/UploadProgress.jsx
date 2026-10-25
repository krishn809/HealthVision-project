import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const UploadProgress = ({ progress, fileName, fileSize, status, error }) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getStatusColor = () => {
        switch (status) {
            case 'uploading':
                return 'bg-blue-500';
            case 'processing':
                return 'bg-yellow-500';
            case 'completed':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'uploading':
                return 'Uploading...';
            case 'processing':
                return 'Processing...';
            case 'completed':
                return 'Upload Complete!';
            case 'error':
                return 'Upload Failed';
            default:
                return 'Preparing...';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'uploading':
            case 'processing':
                return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {getStatusIcon()}
                    <div>
                        <h4 className="font-semibold text-gray-800">{getStatusText()}</h4>
                        <p className="text-sm text-gray-500">{fileName} • {formatFileSize(fileSize)}</p>
                    </div>
                </div>
                <span className="text-lg font-bold text-gray-700">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${getStatusColor()}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default UploadProgress;
