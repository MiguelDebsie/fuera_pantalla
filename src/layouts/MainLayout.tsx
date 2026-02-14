import React from 'react';
import { AuthProvider } from '../context/AuthContext';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative">
                {children}
                <div className="fixed bottom-1 right-1 text-[10px] text-gray-300 font-mono pointer-events-none z-[100]">
                    v0.001
                </div>
            </div>
        </AuthProvider>
    );
};
