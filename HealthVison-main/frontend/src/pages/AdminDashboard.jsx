import React, { useState, useEffect } from 'react';
import { Users, UserPlus, CheckCircle, XCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import adminService from '../services/admin.service';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPending: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create Doctor Form State
    const [doctorForm, setDoctorForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: 'DoctorSecretPassword123!', // Default password for admin-created doctors
        phone: '',
        specialization: '',
        experience: '',
        fee: '',
        location: ''
    });

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const fetchPendingDoctors = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPendingDoctors();
            if (response.success) {
                setPendingDoctors(response.data);
                setStats({ totalPending: response.data.length });
            }
        } catch (error) {
            toast.error("Failed to load pending doctors");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const response = await adminService.approveDoctor(id);
            if (response.success) {
                toast.success("Doctor approved successfully!");
                fetchPendingDoctors();
            }
        } catch (error) {
            toast.error("Approval failed");
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            const userData = {
                name: { first: doctorForm.firstName, last: doctorForm.lastName },
                email: doctorForm.email,
                password: doctorForm.password,
                phone: doctorForm.phone
            };
            const doctorData = {
                specialization: doctorForm.specialization,
                experience: doctorForm.experience,
                fee: doctorForm.fee,
                location: doctorForm.location
            };

            const response = await adminService.adminCreateDoctor(userData, doctorData);
            if (response.success) {
                toast.success("Doctor created and approved!");
                setShowCreateModal(false);
                setDoctorForm({
                    firstName: '', lastName: '', email: '', password: 'DoctorSecretPassword123!',
                    phone: '', specialization: '', experience: '', fee: '', location: ''
                });
                fetchPendingDoctors();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Creation failed");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <ShieldCheck className="w-8 h-8 text-blue-600 mr-3" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Manage doctor profiles and application approvals</p>
                </div>
                <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New Doctor
                </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Pending</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPending}</p>
                </div>
            </div>

            {/* Pending Approvals Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Pending Approvals</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading pending requests...</div>
                    ) : pendingDoctors.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">All caught up!</h4>
                            <p className="text-gray-500">There are no pending doctor approvals.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Doctor Info</th>
                                    <th className="px-6 py-4">Role/Specialization</th>
                                    <th className="px-6 py-4">Applied Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingDoctors.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 overflow-hidden">
                                                    {doc.avatarUrl ? <img src={doc.avatarUrl} alt="" className="w-full h-full object-cover" /> : doc.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{doc.name}</div>
                                                    <div className="text-xs text-gray-500">{doc.userId?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase">
                                                {doc.specialization || 'General Physician'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleApprove(doc._id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white text-xs font-bold rounded-lg transition-all border border-green-200"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                Approve
                                            </button>
                                            <button className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white text-xs font-bold rounded-lg transition-all border border-red-200">
                                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Doctor Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
                            <h2 className="text-xl font-bold flex items-center">
                                <UserPlus className="w-6 h-6 mr-2" />
                                Add New Doctor Profile
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateDoctor} className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="First Name" value={doctorForm.firstName} onChange={e => setDoctorForm({...doctorForm, firstName: e.target.value})} placeholder="e.g. John" required />
                                <Input label="Last Name" value={doctorForm.lastName} onChange={e => setDoctorForm({...doctorForm, lastName: e.target.value})} placeholder="e.g. Doe" required />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Email Address" type="email" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} placeholder="dr.john@example.com" required />
                                <Input label="Phone Number" value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} placeholder="+91 9876543210" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Specialization" value={doctorForm.specialization} onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})} placeholder="e.g. Cardiologist" required />
                                <Input label="Experience (Years)" type="number" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} placeholder="e.g. 10" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Consultation Fee (₹)" type="number" value={doctorForm.fee} onChange={e => setDoctorForm({...doctorForm, fee: e.target.value})} placeholder="e.g. 500" required />
                                <Input label="Location" value={doctorForm.location} onChange={e => setDoctorForm({...doctorForm, location: e.target.value})} placeholder="e.g. Kanpur, India" required />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Secret Password</p>
                                <p className="text-sm text-gray-700 font-mono bg-white p-2 border border-gray-200 rounded">{doctorForm.password}</p>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Doctor can change this once they login</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Create & Approve</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
