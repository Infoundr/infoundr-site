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
            console.log("ProtectedRoute: Checking authentication");
            const auth = await checkIsAuthenticated();
            console.log("ProtectedRoute: Authentication status:", auth);
            setIsAuthenticated(auth);
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        console.log("ProtectedRoute: Still checking auth...");
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        console.log("ProtectedRoute: Not authenticated, redirecting to /dashboard");
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    console.log("ProtectedRoute: Authenticated, rendering children");
    return <>{children}</>;
};

export default ProtectedRoute; 