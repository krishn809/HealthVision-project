import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

export default function PublicLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
}
