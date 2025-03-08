import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkIsAuthenticated } from '../../services/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const auth = await checkIsAuthenticated();
            setIsAuthenticated(auth);
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        // Show loading state while checking auth
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to auth page if not authenticated
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 