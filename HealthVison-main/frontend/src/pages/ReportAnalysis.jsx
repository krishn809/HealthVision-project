import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Activity, AlertCircle } from 'lucide-react';
import AnalysisResult from '../components/AnalysisResult';
import ReportChatbot from '../components/Chatbot/ReportChatbot';
import reportService from '../services/report.service';
import toast from 'react-hot-toast';

const ReportAnalysis = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.getReportById(id);
            setReport(response.report);
        } catch (err) {
            setError(err.message || 'Failed to load report');
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);
            const response = await reportService.analyzeReport(id);

            if (response.mlApiAvailable === false) {
                toast.error('ML service is currently unavailable. Please try again later.');
            } else {
                toast.success('Report analyzed successfully!');
            }

            // Refresh report to get updated analysis
            await fetchReport();
        } catch (err) {
            toast.error(err.message || 'Failed to analyze report');
        } finally {
            setAnalyzing(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading report...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Reports
                </button>
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The requested report could not be found.'}</p>
                    <button
                        onClick={() => navigate('/reports')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Go to Reports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Reports
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{report.fileName}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span>{formatFileSize(report.fileSize)}</span>
                                <span>•</span>
                                <span>{report.fileType.split('/')[1].toUpperCase()}</span>
                                <span>•</span>
                                <span>Uploaded {new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {(!report.analysisResult || report.status === 'pending' || report.status === 'failed') && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing || report.status === 'processing'}
                                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {analyzing || report.status === 'processing' ? (
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
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                report.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Analysis Results */}
            {report.status === 'processing' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-12 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Analysis in Progress</h3>
                    <p className="text-gray-600">
                        Your report is being analyzed. This may take a few moments...
                    </p>
                </div>
            ) : report.analysisResult || report.extractedText ? (
                <AnalysisResult report={report} />
            ) : (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-purple-200 p-12 text-center">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Activity className="w-10 h-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Analyze</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Click the "Analyze Report" button above to get AI-powered insights and recommendations from your medical report.
                    </p>
                </div>
            )}


            {/* Chatbot Overlay */}
            {report && (
                <ReportChatbot reportId={report._id} reportName={report.fileName} />
            )}
        </div>
    );
};

export default ReportAnalysis;
