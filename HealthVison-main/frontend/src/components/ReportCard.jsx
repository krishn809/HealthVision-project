import React from 'react';
import { FileText, Calendar, Eye, Activity, Trash2, Clock } from 'lucide-react';

const ReportCard = ({ report, onAnalyze, onView, onDelete, isAnalyzing }) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                {config.label}
            </span>
        );
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-5">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
                        <FileText className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                            {report.fileName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded">
                            {formatFileSize(report.fileSize)} • {report.fileType.split('/')[1].toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="self-end sm:self-start">
                    {getStatusBadge(report.status)}
                </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Uploaded: {formatDate(report.createdAt)}</span>
            </div>

            {report.analysisResult?.analyzedAt && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Analyzed: {formatDate(report.analysisResult.analyzedAt)}</span>
                </div>
            )}

            <div className="flex gap-2 mt-4">
                {report.status === 'completed' && report.analysisResult ? (
                    <button
                        onClick={() => onView(report._id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Analysis
                    </button>
                ) : report.status === 'processing' ? (
                    <button
                        disabled
                        className="flex-1 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center justify-center cursor-not-allowed"
                    >
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                        Processing...
                    </button>
                ) : (
                    <button
                        onClick={() => onAnalyze(report._id)}
                        disabled={isAnalyzing}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Activity className="w-4 h-4 mr-2" />
                                Analyze Report
                            </>
                        )}
                    </button>
                )}

                <button
                    onClick={() => onDelete(report._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                    aria-label={`Delete report ${report.fileName}`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ReportCard;
