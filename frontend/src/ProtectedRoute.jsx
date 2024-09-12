import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './Authentication/AuthContext';

const ProtectedRoute = ({ element }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? element : <Navigate to="/authentication" />;
};

export default ProtectedRoute;