import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const AdminRoute = () => {
    const user = authService.getCurrentUser();

    if (!user || user.role !== 'admin') {
        toast.error("Access Denied. Admins only.");
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
