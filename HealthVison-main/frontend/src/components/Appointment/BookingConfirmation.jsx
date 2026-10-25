import React from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, Wallet } from 'lucide-react';
import Avatar from '../ui/Avatar';

const BookingConfirmation = ({ doctor, date, time, onConfirm, loading, walletBalance, useWallet, setUseWallet }) => {
    if (!doctor || !date || !time) return null;

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const fee = doctor.fee || doctor.fees || 500;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
                <h2 className="text-2xl font-bold mb-2">Confirm Booking</h2>
                <p className="opacity-90">Please review your appointment details</p>
            </div>

            <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                    {/* Doctor Info */}
                    <div className="flex-1 w-full bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar
                                src={doctor.avatarUrl || doctor.image}
                                alt={doctor.name}
                                className="w-16 h-16 border-2 border-white shadow-sm"
                                iconSize="w-8 h-8"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{doctor.clinicAddress || 'Virtual Consultation'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{doctor.experience} years experience</span>
                            </div>
                        </div>
                    </div>

                    {/* Slot Info */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Date</p>
                                <p className="font-bold text-gray-900">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Time</p>
                                <p className="font-bold text-gray-900">{time}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Consultation Fee</p>
                                <p className="font-bold text-gray-900">₹{fee}</p>
                            </div>
                            {useWallet && walletBalance > 0 && walletBalance < fee && (
                                <div className="text-right">
                                    <p className="text-[10px] text-blue-600 font-bold uppercase">-₹{Math.min(walletBalance, fee)} Wallet</p>
                                    <p className="text-xs font-bold text-gray-900">Net: ₹{fee - Math.min(walletBalance, fee)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Wallet Payment Option */}
                <div className="mb-8 p-6 rounded-2xl border-2 transition-all cursor-pointer group"
                    onClick={() => setUseWallet(!useWallet)}
                    style={{
                        borderColor: useWallet ? '#2563eb' : '#f1f5f9',
                        backgroundColor: useWallet ? '#eff6ff' : '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${useWallet ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Use Wallet Balance</h4>
                                <p className="text-sm text-gray-500 font-medium">Available: ₹{walletBalance.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${useWallet ? 'bg-blue-600 border-blue-600 scale-110' : 'bg-white border-gray-300'}`}>
                            {useWallet && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center ${useWallet && walletBalance >= fee
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-200 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            useWallet
                                ? (walletBalance >= fee
                                    ? 'Pay with Wallet'
                                    : `Pay ₹${fee - walletBalance} + Wallet`)
                                : 'Confirm & Pay'
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400">
                        By confirming, you agree to the terms of service and cancellation policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
