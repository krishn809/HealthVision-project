import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/Chatbot/ChatInterface';
import chatbotService from '../services/chatbot.service';
import toast from 'react-hot-toast';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await chatbotService.getHistory();
            if (response.success) {
                const formattedMessages = response.data.map(msg => ({
                    text: msg.message,
                    isUser: true,
                    timestamp: msg.timestamp
                })).concat(response.data.map(msg => ({
                    text: msg.response,
                    isUser: false,
                    timestamp: msg.timestamp // ideally response timestamp
                }))).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                const historyHelper = [];
                // backend returns newest first, so we reverse it to process chronologically
                [...response.data].reverse().forEach(chat => {
                    historyHelper.push({
                        text: chat.message,
                        isUser: true,
                        timestamp: chat.createdAt || chat.timestamp
                    });
                    if (chat.response) {
                        historyHelper.push({
                            text: chat.response,
                            isUser: false,
                            timestamp: chat.createdAt || chat.timestamp
                        });
                    }
                });
                setMessages(historyHelper);
            }
        } catch (error) {
            // Error handled by loading state
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (text, urgency) => {
        // Optimistically add user message
        const userMsg = { text, isUser: true, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const response = await chatbotService.sendMessage(text, urgency);
            if (response.success) {
                const botMsg = {
                    text: response.data.response,
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Symptom Checker AI</h1>
            <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loading}
            />
        </div>
    );
};

export default Chatbot;
