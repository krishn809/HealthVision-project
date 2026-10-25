import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/auth.service';
import { isProfileComplete } from '../utils/user.utils';

const ProtectedRoute = () => {
    const user = authService.getCurrentUser();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.token) {
            toast.error("Please login to access the dashboard", { id: 'auth-error' });
        } else if (authService.isTokenExpired(user.token)) {
            authService.logout();
            toast.error("Session expired. Please login again.", { id: 'session-expired' });
            navigate('/login', { replace: true });
        } else if (user && isProfileComplete && !isProfileComplete(user)) {
            const profilePath = user.role === 'doctor' ? '/doctor/profile' : '/profile';
            if (location.pathname !== profilePath) {
                toast.error("Please complete your profile details first", { id: 'profile-incomplete' });
                navigate(profilePath, { replace: true });
            }
        }
    }, [user, location.pathname, navigate]);

    if (!user || !user.token || authService.isTokenExpired(user.token)) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!isProfileComplete(user)) {
        const profilePath = user.role === 'doctor' ? '/doctor/profile' : '/profile';
        if (location.pathname !== profilePath) {
            return <Navigate to={profilePath} replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
