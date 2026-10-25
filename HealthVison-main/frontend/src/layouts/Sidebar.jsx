import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, MessageSquare, X, CreditCard } from 'lucide-react';
import authService from '../services/auth.service';

export default function Sidebar({ isOpen, setIsOpen }) {
    const userRole = authService.getCurrentUser()?.role;

    const navItems = userRole === 'admin' 
        ? [{ path: '/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard }]
        : [
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ...(userRole !== 'doctor' ? [
                { path: '/doctors', label: 'Find Doctors', icon: Users },
                { path: '/reports', label: 'Reports', icon: FileText },
                { path: '/payment/history', label: 'Payment History', icon: CreditCard },
                { path: '/chat', label: 'Symptom Chat', icon: MessageSquare },
            ] : []),
            { path: '/appointments', label: userRole === 'doctor' ? 'Assigned' : 'Appointments', icon: Calendar },
        ];

    const toggleClass = isOpen ? 'translate-x-0' : '-translate-x-full';
    const widthClass = isOpen ? 'w-64' : 'w-0';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed md:static inset-y-0 left-0 z-30
                ${widthClass} bg-white h-full ${isOpen ? 'border-r border-gray-100' : ''} transition-all duration-300 ease-in-out
                ${toggleClass} overflow-hidden
            `}>
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between mb-8 md:hidden">
                        <span className="font-bold text-blue-600 text-xl">Menu</span>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <nav className="flex flex-col space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}
                                `}
                            >
                                <item.icon className={`w-5 h-5 ${isOpen || 'md:inline'} transition-colors`} />
                                <span className={`${isOpen ? 'inline' : 'hidden md:inline'} whitespace-nowrap`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
