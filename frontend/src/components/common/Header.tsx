import React from 'react';
import { useAuth } from '../../context/AuthContext';
// import { Sun } from 'lucide-react';

const Header: React.FC = () => {
    const { user } = useAuth();

    return (
        <header className="flex justify-end items-center p-6 border-b border-surface-accent h-24">
            <div className="flex items-center space-x-6">
                {/* <button className="text-accent-icon hover:text-white transition">
                    <Sun className="w-5 h-5" />
                </button> */}
                {user && (
                    <div className="w-10 h-10 rounded-full bg-surface-accent flex items-center justify-center font-bold text-lg text-primary capitalize">
                        {user.email.charAt(0)}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;