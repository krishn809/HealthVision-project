import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/auth.service';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setIsSubmitted(true);
            toast.success('Password reset link sent to your email');
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div>
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                        Check your email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We have sent a password reset link to <strong>{email}</strong>.
                    </p>
                    <div className="mt-6 text-center">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Return to sign in
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
                    Forgot your password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="mt-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        id="email"
                        label="Email address"
                        type="email"
                        placeholder="user@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div>
                        <Button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium"
                            isLoading={isLoading}
                        >
                            Send Reset Link
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Back to sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
