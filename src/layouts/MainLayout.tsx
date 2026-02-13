import React from 'react';
import { AuthProvider } from '../context/AuthContext';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                {children}
            </div>
        </AuthProvider>
    );
};
