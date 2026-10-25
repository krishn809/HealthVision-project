import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './layouts/Layout';
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/Doctors/DoctorDashboard';
import DoctorProfile from './pages/Doctors/DoctorProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import DoctorsList from './pages/Doctors/DoctorsList';
import DoctorDetail from './pages/Doctors/DoctorDetail';
import ReportUpload from './pages/ReportUpload';
import Reports from './pages/Reports';
import ReportAnalysis from './pages/ReportAnalysis';
import Chatbot from './pages/Chatbot';
import AppointmentBooking from './pages/AppointmentBooking';
import Appointments from './pages/Appointments';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentHistory from './pages/PaymentHistory';
import VideoConsultation from './pages/VideoConsultation';
import authService from './services/auth.service';
import PublicRoute from './components/PublicRoute';
import Home from './components/homepage/Home.jsx';
import About from './components/homepage/About.jsx';

const DashboardWrapper = () => {
  const user = authService.getCurrentUser();
  if (user?.role === 'admin') return <AdminDashboard />;
  return user?.role === 'doctor' ? <DoctorDashboard /> : <Dashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" containerStyle={{ zIndex: 999999 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Public Routes (Redirect to Dashboard if logged in) */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardWrapper />} />
            <Route path="reports/upload" element={<ReportUpload />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:id" element={<ReportAnalysis />} />
            <Route path="chat" element={<Chatbot />} />
            <Route path="appointments/book" element={<AppointmentBooking />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment/failure" element={<PaymentFailure />} />
            <Route path="payment/history" element={<PaymentHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="doctor/profile" element={<DoctorProfile />} />
            <Route path="consultation/:roomId" element={<VideoConsultation />} />
            
            {/* Admin Specific Routes */}
            <Route element={<AdminRoute />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<div className="p-4">404 Not Found</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
// commented and pushed code just to create a new pull request and merge it with main
export default App;
