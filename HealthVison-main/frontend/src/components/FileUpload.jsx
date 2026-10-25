import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

const FileUpload = ({ onFileSelect, selectedFile, onRemove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validateFile = (file) => {
        setError('');

        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only PDF and image files (JPEG, PNG) are allowed.');
            return false;
        }

        if (file.size > maxSize) {
            setError('File size exceeds 10MB limit.');
            return false;
        }

        return true;
    };

    const handleFileChange = (file) => {
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type === 'application/pdf') {
            return <FileText className="w-8 h-8 text-red-500" />;
        }
        return <Image className="w-8 h-8 text-blue-500" />;
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50 shadow-inner bg-gray-50/30'
                        }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleInputChange}
                    />

                    <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {isDragging ? 'Drop your file here' : 'Upload Medical Report'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-gray-400">
                            Supported formats: PDF, JPG, PNG (Max 10MB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                {getFileIcon(selectedFile.type)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 mb-1">
                                    {selectedFile.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                                <p className="text-xs text-green-600 mt-2 font-medium">
                                    ✓ Ready to upload
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                                setError('');
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
