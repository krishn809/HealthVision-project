import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/auth.service';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password) {
            toast.error('Please enter a new password');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, password);
            toast.success('Password reset successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                    Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your new password below.
                </p>
            </div>

            <div className="mt-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        id="password"
                        label="New Password"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        id="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <div>
                        <Button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium"
                            isLoading={isLoading}
                        >
                            Reset Password
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
