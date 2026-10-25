import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/auth.service';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // 'form' | 'otp'
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');

    const validate = () => {
        const newErrors = {};
        const firstName = formData.firstName.trim();
        const lastName = formData.lastName.trim();
        const email = formData.email.trim();
        const password = formData.password.trim();
        const confirmPassword = formData.confirmPassword.trim();

        if (!firstName) newErrors.firstName = 'First name is required';
        if (!lastName) newErrors.lastName = 'Last name is required';
        if (!email) {
            newErrors.email = 'Please enter your email address';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!password) {
            newErrors.password = 'Please enter a password';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.phone) newErrors.phone = 'Phone number is required';

        return newErrors;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
        if (apiError) setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setApiError('');
        try {
            const registrationData = {
                name: { first: formData.firstName, last: formData.lastName },
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role || 'patient'
            };
            await authService.register(registrationData);
            setStep('otp');
        } catch (err) {
            setApiError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setApiError('Please enter the 6-digit OTP sent to your email.');
            return;
        }
        setIsLoading(true);
        setApiError('');
        try {
            const response = await authService.verifyOtp(otp);
            const user = authService.getCurrentUser();
            
            if (user?.role === 'doctor') {
                toast.success("Email verified! Your doctor profile is now pending admin approval. We'll notify you once it's active.", { duration: 6000 });
                navigate('/dashboard');
            } else {
                toast.success("Account verified successfully!");
                navigate('/');
            }
        } catch (err) {
            setApiError(err.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setApiError('');
        setOtpSuccess('');
        try {
            await authService.sendOtp();
            setOtpSuccess('A new OTP has been sent to your email.');
        } catch (err) {
            setApiError(err.message || 'Failed to resend OTP.');
        }
    };

    const EyeIcon = ({ visible, onClick }) => (
        <button type="button" className="text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClick}>
            {visible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
            )}
        </button>
    );

    // ── OTP Step ──────────────────────────────────────────────────────────────
    if (step === 'otp') {
        return (
            <div>
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-center text-3xl font-bold text-gray-900">Verify your email</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We've sent a 6-digit OTP to <span className="font-medium text-indigo-600">{formData.email}</span>
                    </p>
                </div>

                <div className="mt-8">
                    <form className="space-y-6" onSubmit={handleVerifyOtp}>
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{apiError}</span>
                            </div>
                        )}
                        {otpSuccess && (
                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative">
                                <span className="block sm:inline">{otpSuccess}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                Enter OTP
                            </label>
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setApiError(''); }}
                                placeholder="••••••"
                                className="block w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">OTP is valid for 10 minutes.</p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Verify & Continue
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Didn't receive it?{' '}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Resend OTP
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        );
    }

    // ── Registration Form ─────────────────────────────────────────────────────
    return (
        <div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{apiError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="firstName" label="First Name" type="text" placeholder="e.g., Rishi" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
                        <Input id="lastName" label="Last Name" type="text" placeholder="e.g., Tiwari" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
                    </div>

                    <Input id="email" label="Email address" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} error={errors.email} />

                    <Input
                        id="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        helperText="Must be at least 6 characters"
                        rightElement={<EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
                    />

                    <Input
                        id="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        helperText={
                            formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
                                ? <span className="text-green-600 font-medium text-xs">Matched</span>
                                : ""
                        }
                        rightElement={<EyeIcon visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="phone" label="Phone Number (+91)" type="tel" placeholder="98765 43210" value={formData.phone} onChange={handleChange} error={errors.phone} />
                        <div className="flex flex-col">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                id="role"
                                value={formData.role || 'patient'}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Sign up
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
