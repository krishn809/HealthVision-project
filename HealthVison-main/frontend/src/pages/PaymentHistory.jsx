import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import paymentService from '../services/payment.service';
import toast from 'react-hot-toast';

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                const data = await paymentService.getPaymentHistory();
                setPayments(data.payments || []);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                toast.error('Failed to load payment history');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    icon: <CheckCircle2 className="w-4 h-4" />
                };
            case 'pending':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-700',
                    icon: <Clock className="w-4 h-4" />
                };
            case 'failed':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    icon: <XCircle className="w-4 h-4" />
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    icon: <AlertCircle className="w-4 h-4" />
                };
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        Payment History
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage your consultation payments and transactions.
                    </p>
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                    <p className="mt-2 text-sm text-gray-500">You haven't made any consultation payments yet.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Appointment</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {payments.map((payment) => {
                                    const statusStyle = getStatusStyle(payment.status);
                                    const date = new Date(payment.createdAt).toLocaleDateString();
                                    const appointment = payment.appointmentId;

                                    return (
                                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        {appointment?.doctorId?.name
                                                            ? (appointment.doctorId.name.toLowerCase().startsWith('dr.')
                                                                ? appointment.doctorId.name
                                                                : `Dr. ${appointment.doctorId.name}`)
                                                            : 'Unknown Doctor'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 ml-5">
                                                        {appointment?.date ? new Date(appointment.date).toLocaleDateString() : ''} at {appointment?.time || ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ₹{payment.amount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {statusStyle.icon}
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 font-mono">
                                                    {payment.transactionId || payment.paymentId || 'N/A'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
