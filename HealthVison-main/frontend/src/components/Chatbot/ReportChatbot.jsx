import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import chatbotService from '../../services/chatbot.service';
import toast from 'react-hot-toast';

const ReportChatbot = ({ reportId, reportName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial welcome message based on report context
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    text: `Hello! I've analyzed your report "${reportName}". You can ask me questions about the findings, medical terms, or recommendations.`,
                    isUser: false,
                    timestamp: new Date()
                }
            ]);
        }
    }, [isOpen, reportName]);

    const handleSendMessage = async (text, urgency) => {
        // Optimistically add user message
        const userMsg = { text, isUser: true, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            // Send message with report context
            const response = await chatbotService.sendMessage(
                text,
                urgency,
                reportId,
                'report_analysis'
            );

            if (response.success) {
                const botMsg = {
                    text: response.data.response,
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
            }
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-[9999] flex items-center gap-2 group"
            >
                <MessageSquare className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
                    Ask AI about this report
                </span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-24 right-6 z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isMinimized ? 'w-72 h-14' : 'w-[400px] h-[600px]'
            }`}>
            {/* Header */}
            <div className="bg-blue-600 p-3 flex justify-between items-center cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-semibold text-sm">AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(!isMinimized);
                        }}
                        className="p-1 hover:bg-blue-500 rounded text-white transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        className="p-1 hover:bg-blue-500 rounded text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Interface */}
            {!isMinimized && (
                <div className="flex-1 flex flex-col h-[calc(100%-3.5rem)]">
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        loading={loading}
                        compact={true} // You might want to update ChatInterface to support a compact mode if needed
                    />
                </div>
            )}
        </div>
    );
};

export default ReportChatbot;
