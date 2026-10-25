import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import authService from '../services/auth.service';
import UserProfile from '../components/Dashboard/UserProfile';
import Avatar from '../components/ui/Avatar';

export default function Header({ toggleSidebar }) {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [showProfile, setShowProfile] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow p-3 md:p-4 flex justify-between items-center z-30 relative border-b border-gray-100">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    aria-label="Toggle Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <Link to="/dashboard" className="flex items-center gap-2 transition-colors hover:opacity-90">
                    <img src="/logo-text.png" alt="HealthVision" className="h-8 auto" />
                </Link>
            </div>
            <div className="flex space-x-2 md:space-x-4 items-center">
                {user ? (
                    <>
                        <div
                            className={`flex items-center space-x-2 ${user.role !== 'admin' ? 'cursor-pointer hover:bg-gray-50' : ''} p-2 rounded-lg transition-colors`}
                            onClick={() => user.role !== 'admin' && setShowProfile(!showProfile)}
                        >
                            <Avatar
                                src={user.avatarUrl}
                                alt={user.name?.first}
                                className="w-8 h-8"
                                iconSize="w-4 h-4"
                            />
                            <span className="hidden sm:inline text-gray-700 font-medium">{user.name?.first || 'User'}</span>
                        </div>

                        {showProfile && (
                            <div className="absolute top-16 right-4 w-80 z-50">
                                <div className="absolute top-[-10px] right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
                                <UserProfile user={user} />
                                {user.role !== 'admin' && (
                                    <div className="bg-white border-t border-gray-100 rounded-b-xl shadow-lg p-3">
                                        <Link
                                            to={user.role === 'doctor' ? "/doctor/profile" : "/profile"}
                                            onClick={() => setShowProfile(false)}
                                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                            Manage Profile
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="ml-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/doctors" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium">Find Doctors</Link>
                        <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600">Login</Link>
                        <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Signup</Link>
                    </>
                )}
            </div>
        </header>
    );
}
