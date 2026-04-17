import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import History from './pages/History';
import LoginPage from './pages/LoginPage'; // Keep this import
import SignupPage from './pages/SignupPage';
import ImageToTextPage from './pages/ImageToTextPage';
import Recipes from './pages/Recipes';
import TeachRecipe from './pages/TeachRecipe';
import QrCodeReader from './pages/QrCodeReader';
// Simple PrivateRoute component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, loading } = useAuth();

    if (loading) return <div className="text-center mt-10 text-text-primary">Authenticating...</div>;
    return token ? <>{children}</> : <Navigate to="/login" />;
};


// --- REMOVED THE TEMPORARY LoginPage COMPONENT FROM HERE ---

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Now this will use the actual LoginPage.tsx file */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/imagetotext" element={<PrivateRoute><Layout><ImageToTextPage /></Layout></PrivateRoute>} />
                    <Route path="/qrcode" element={<PrivateRoute><Layout><QrCodeReader /></Layout></PrivateRoute>} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                    <Route path="/scanner" element={<PrivateRoute><Layout><Scanner /></Layout></PrivateRoute>} />
                    <Route path="/history" element={<PrivateRoute><Layout><History /></Layout></PrivateRoute>} />
                    <Route path="/recipes" element={<PrivateRoute><Recipes /></PrivateRoute>} />
                    <Route path="/recipes/:id" element={<PrivateRoute><TeachRecipe /></PrivateRoute>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;