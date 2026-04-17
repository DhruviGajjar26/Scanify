import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileScan, History, LogOut, FileImage, BookOpen, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {  useNavigate } from 'react-router-dom';
const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Scanner', icon: FileScan, path: '/scanner' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Image To Text', icon: FileImage, path: '/imagetotext' },
    { name: 'QR Code Reader', icon: QrCode, path: '/qrcode' },
    { name: 'Recipes', icon: BookOpen, path: '/recipes' }
];

const Sidebar: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
    logout();
    navigate('/login');
};

    return (
        <aside className="w-64 bg-surface border-r border-surface-accent flex flex-col p-6 space-y-12">
            <div className="flex items-center space-x-2 text-primary font-bold text-2xl">
                 <div className="w-10 h-10 bg-surface-accent rounded-xl flex items-center justify-center border border-primary/20">
                 <img 
                    src="/logo.png" 
                    alt="icon" 
                    className="w-full h-full object-cover rounded-xl"
                />
                 </div>
                <span>Scanify</span>
            </div>

            <div className="space-y-4">
                <p className="text-text-secondary uppercase text-xs font-semibold tracking-wider">MENU</p>
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-button transition-colors duration-150 group
                                 ${isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-text-primary hover:bg-surface-accent'}`
                            }
                        >
                            <item.icon className="w-5 h-5 group-hover:text-primary" />
                            {item.name}
                        </NavLink>
                        
                    ))}
                </nav>
            </div>

            <div className="mt-auto border-t border-surface-accent pt-6 space-y-6">
                {user && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-accent flex items-center justify-center font-bold text-lg text-primary capitalize">
                        {user.email.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-text-primary">{user.email.split('@')[0]}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                )}
        
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-text-secondary hover:text-red-400 transition"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;