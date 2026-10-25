import { useState, useEffect, useCallback, memo } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Activity, ShieldAlert, Heart, Plus, Save, Camera, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/user.service';
import authService from '../services/auth.service';
import Avatar from '../components/ui/Avatar';
import CropModal from '../components/ui/CropModal';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import toast from 'react-hot-toast';

// --- Sub-components ---

const PersonalInfoSection = memo(({ formData, onChange, onFileChange }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
                <Avatar src={formData.avatarUrl} alt={formData.name.first} className="w-32 h-32 border-4 border-blue-50 shadow-sm" />
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-all group-hover:scale-110">
                    <Camera className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                </label>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input id="name.first" value={formData.name.first} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input id="name.last" value={formData.name.last} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (+91)</label>
                    <input id="phone" value={formData.phone} onChange={onChange} placeholder="98765 43210" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select id="gender" value={formData.gender} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <CustomDatePicker 
                        id="dateOfBirth" 
                        value={formData.dateOfBirth} 
                        onChange={onChange} 
                    />
                </div>
            </div>
        </div>
    </div>
));

const AddressSection = memo(({ address, location, onChange }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Address Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input id="address.street" value={address.street} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input id="address.city" value={address.city} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                <input id="address.state" value={address.state} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                <input id="address.zipCode" value={address.zipCode} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input id="address.country" value={address.country} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">General Location (shown on dashboard)</label>
                <input id="location" value={location} onChange={onChange} placeholder="e.g., Kanpur, UP" className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
        </div>
    </div>
));

const VitalsSection = memo(({ bloodGroup, height, weight, onChange }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Medical Vitals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select id="bloodGroup" value={bloodGroup} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow">
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input id="height" type="number" value={height} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input id="weight" type="number" value={weight} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow" />
            </div>
        </div>
    </div>
));

const DynamicArraySection = memo(({ title, icon: Icon, iconColor, field, items, onAdd, onRemove, onChange, placeholder }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                {title}
            </span>
            <button type="button" onClick={() => onAdd(field)} className="text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors">
                <Plus className="w-5 h-5" />
            </button>
        </h2>
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                    <input value={item} onChange={(e) => onChange(field, index, e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder={placeholder} />
                    <button type="button" onClick={() => onRemove(field, index)} className="text-gray-400 hover:text-red-600 p-2">✕</button>
                </div>
            ))}
            {items.length === 0 && <p className="text-gray-400 text-sm italic">No {title.toLowerCase()} listed</p>}
        </div>
    </div>
));

const EmergencyContactSection = memo(({ contact, onChange }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Emergency Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input id="emergencyContact.name" value={contact.name} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (+91)</label>
                <input id="emergencyContact.phone" value={contact.phone} onChange={onChange} placeholder="98765 43210" className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <input id="emergencyContact.relation" value={contact.relation} onChange={onChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
        </div>
    </div>
));

// --- Main component ---

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isVerified, setIsVerified] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: { first: '', last: '' },
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: ''
        },
        location: '',
        bloodGroup: '',
        height: '',
        weight: '',
        allergies: [],
        medicalHistory: [],
        currentMedications: [],
        emergencyContact: {
            name: '',
            phone: '',
            relation: ''
        },
        avatarUrl: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userService.getCurrentUser();
            if (response.user) {
                const data = response.user;
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    name: {
                        first: data.name?.first || '',
                        last: data.name?.last || ''
                    },
                    address: {
                        street: data.address?.street || '',
                        city: data.address?.city || '',
                        state: data.address?.state || '',
                        zipCode: data.address?.zipCode || '',
                        country: data.address?.country || ''
                    },
                    emergencyContact: {
                        name: data.emergencyContact?.name || '',
                        phone: data.emergencyContact?.phone || '',
                        relation: data.emergencyContact?.relation || ''
                    },
                    allergies: Array.isArray(data.allergies) ? data.allergies : [],
                    medicalHistory: Array.isArray(data.medicalHistory)
                        ? data.medicalHistory.map(item => typeof item === 'object' ? (item.condition || '') : item)
                        : [],
                    currentMedications: Array.isArray(data.currentMedications)
                        ? data.currentMedications.map(item => typeof item === 'object' ? (item.name || '') : item)
                        : []
                }));
                setIsVerified(data.isVerified ?? true);
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        if (id.includes('.')) {
            const [parent, child] = id.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    }, []);

    const handleArrayChange = useCallback((field, index, value) => {
        setFormData(prev => {
            const newArray = [...prev[field]];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    }, []);

    const addArrayItem = useCallback((field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    }, []);

    const removeArrayItem = useCallback((field, index) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    }, []);

    const handleCropComplete = useCallback((croppedImage) => {
        setFormData(prev => ({ ...prev, avatarUrl: croppedImage }));
        setImageToCrop(null);
    }, []);

    const handleCropCancel = useCallback(() => {
        setImageToCrop(null);
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const updates = { ...formData };
            if (updates.medicalHistory) {
                updates.medicalHistory = updates.medicalHistory.map(h => typeof h === 'string' ? { condition: h } : h);
            }
            if (updates.currentMedications) {
                updates.currentMedications = updates.currentMedications.map(m => typeof m === 'string' ? { name: m } : m);
            }
            delete updates.email;
            delete updates.role;
            delete updates._id;
            delete updates.id;

            await userService.updateProfile(updates);
            toast.success('Profile updated successfully');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSendOtp = async () => {
        setOtpLoading(true);
        try {
            await authService.sendOtp();
            setOtpSent(true);
            toast.success('OTP sent to your email!');
        } catch (err) {
            toast.error(err.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue || otpValue.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            return;
        }
        setOtpLoading(true);
        try {
            await authService.verifyOtp(otpValue);
            setIsVerified(true);
            setOtpSent(false);
            setOtpValue('');
            toast.success('Email verified successfully!');
        } catch (err) {
            toast.error(err.message || 'Invalid or expired OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {!isVerified && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-amber-800">Verify your email address</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                Your email <span className="font-medium">{formData.email}</span> is not verified.
                                Verify it to ensure you receive important notifications.
                            </p>
                            {!otpSent ? (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpLoading}
                                    className="mt-3 px-4 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {otpLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            ) : (
                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 6-digit OTP"
                                        className="px-3 py-1.5 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-40 tracking-widest"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={otpLoading}
                                        className="px-4 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {otpLoading ? 'Verifying...' : 'Verify'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={otpLoading}
                                        className="text-sm text-amber-700 hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isVerified && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">Email verified</p>
                </div>
            )}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Profile</h1>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <PersonalInfoSection
                    formData={formData}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                />

                <AddressSection
                    address={formData.address}
                    location={formData.location}
                    onChange={handleChange}
                />

                <VitalsSection
                    bloodGroup={formData.bloodGroup}
                    height={formData.height}
                    weight={formData.weight}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DynamicArraySection
                        title="Allergies"
                        icon={ShieldAlert}
                        iconColor="text-red-600"
                        field="allergies"
                        items={formData.allergies}
                        onAdd={addArrayItem}
                        onRemove={removeArrayItem}
                        onChange={handleArrayChange}
                        placeholder="e.g. Peanuts"
                    />

                    <DynamicArraySection
                        title="Medications"
                        icon={Activity}
                        iconColor="text-indigo-600"
                        field="currentMedications"
                        items={formData.currentMedications}
                        onAdd={addArrayItem}
                        onRemove={removeArrayItem}
                        onChange={handleArrayChange}
                        placeholder="e.g. Paracetamol"
                    />
                </div>

                <EmergencyContactSection
                    contact={formData.emergencyContact}
                    onChange={handleChange}
                />
            </form>

            {imageToCrop && (
                <CropModal
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}
