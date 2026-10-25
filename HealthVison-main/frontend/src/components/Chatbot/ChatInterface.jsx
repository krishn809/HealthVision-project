import React, { useEffect, useRef, useState } from 'react';
import { Send, User, Bot, Clock, ChevronDown, Check } from 'lucide-react';

const ChatInterface = ({ messages, onSendMessage, loading }) => {
    const messagesContainerRef = useRef(null);
    const dropdownRef = useRef(null);
    const [input, setInput] = useState('');
    const [urgency, setUrgency] = useState('Low');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const urgencyConfig = {
        Low: { color: 'bg-emerald-500', label: 'Low', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        Medium: { color: 'bg-amber-500', label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
        High: { color: 'bg-rose-500', label: 'High', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input, urgency);
            setInput('');
        }
    };

    const formatMessage = (text) => {
        if (!text) return null;

        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-blue-50/50 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-blue-200 shadow-lg flex items-center justify-center mr-3">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Health Assistant</h3>
                        <p className="text-xs text-gray-500 font-medium">AI-powered symptom checker</p>
                    </div>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95 ${urgencyConfig[urgency].badge}`}
                    >
                        <span className={`w-2 h-2 rounded-full shadow-sm ${urgencyConfig[urgency].color}`} />
                        {urgency}
                        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            <div className="p-1.5 space-y-0.5">
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Urgency Level
                                </div>
                                {Object.keys(urgencyConfig).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => {
                                            setUrgency(level);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${urgency === level
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full ${urgencyConfig[level].color}`} />
                                        {level}
                                        {urgency === level && <Check className="w-4 h-4 ml-auto text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Describe your symptoms to get started.</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isUser ? 'bg-blue-600 ml-2' : 'bg-green-600 mr-2'}`}>
                                {msg.isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <div className={`p-4 rounded-2xl ${msg.isUser
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                                    }`}>
                                    <div className="text-sm whitespace-pre-wrap">{formatMessage(msg.text)}</div>
                                </div>
                                <div className={`text-xs text-gray-400 mt-1 flex items-center ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%] flex-row">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mr-2">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your symptoms..."
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
