import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const PublicRoute = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    
    useEffect(() => {
        // If user is logged in, redirect to dashboard
        if (user && user.token && !authService.isTokenExpired(user.token)) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Render the public children routes (login, signup, etc.)
    return <Outlet />;
};

export default PublicRoute;
