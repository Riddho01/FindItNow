import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './MainPage';
import AdminDashboard from './AdminDashboard';
import Authentication from './Authentication/Authentication';
import ProtectedRoute from './ProtectedRoute'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <div>
            <ToastContainer />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} />} />
                <Route path="/authentication" element={<Authentication />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
