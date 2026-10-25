import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Upload as UploadIcon } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import UploadProgress from '../components/UploadProgress';
import reportService from '../services/report.service';
import toast from 'react-hot-toast';

const ReportUpload = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, completed, error
    const [uploadError, setUploadError] = useState('');
    const [uploadedReport, setUploadedReport] = useState(null);

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setUploadError('');
        setUploadStatus('idle');
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setUploadError('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploading(true);
        setUploadStatus('uploading');
        setUploadError('');

        try {
            const response = await reportService.uploadReport(
                selectedFile,
                (progress) => {
                    setUploadProgress(progress);
                }
            );

            setUploadStatus('completed');
            setUploadProgress(100);
            setUploadedReport(response.report);
            toast.success('Report uploaded successfully!');
        } catch (error) {
            setUploadStatus('error');
            setUploadError(error.message || 'Failed to upload report. Please try again.');
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadAnother = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setUploadError('');
        setUploadedReport(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Medical Report</h1>
                <p className="text-gray-600">
                    Upload your medical reports for AI-powered analysis and insights
                </p>
            </div>

            {/* Upload Section */}
            {uploadStatus !== 'completed' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                        onRemove={handleRemoveFile}
                    />

                    {/* Upload Progress */}
                    {uploading && selectedFile && (
                        <div className="mt-6">
                            <UploadProgress
                                progress={uploadProgress}
                                fileName={selectedFile.name}
                                fileSize={selectedFile.size}
                                status={uploadStatus}
                                error={uploadError}
                            />
                        </div>
                    )}

                    {/* Upload Button */}
                    {!uploading && selectedFile && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold flex items-center transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <UploadIcon className="w-5 h-5 mr-2" />
                                Upload Report
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* Success State */
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-8">
                    <div className="text-center">
                        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Successful!</h2>
                        <p className="text-gray-600 mb-6">
                            Your medical report has been uploaded successfully.
                        </p>

                        {uploadedReport && (
                            <div className="bg-white rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-semibold text-gray-800 mb-2">Report Details</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><span className="font-medium">File Name:</span> {uploadedReport.fileName}</p>
                                    <p><span className="font-medium">Status:</span> <span className="text-yellow-600 capitalize">{uploadedReport.status}</span></p>
                                    <p><span className="font-medium">Uploaded:</span> {new Date(uploadedReport.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/reports')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                View All Reports
                            </button>
                            <button
                                onClick={handleUploadAnother}
                                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Upload Another
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Your report will be processed using advanced OCR technology</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>AI will analyze the report for potential health insights</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>You'll receive a detailed analysis with recommendations</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>All your reports are securely stored and accessible anytime</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ReportUpload;
