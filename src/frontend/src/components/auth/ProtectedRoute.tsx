import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkIsAuthenticated } from '../../services/auth';
import LoadingSpinner from '../../components/LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            console.log("ProtectedRoute: Starting authentication check");
            console.log("ProtectedRoute: Current location:", location.pathname);
            console.log("ProtectedRoute: Auth mode:", import.meta.env.VITE_AUTH_MODE);
            
            const auth = await checkIsAuthenticated();
            console.log("ProtectedRoute: Authentication status:", auth);
            console.log("ProtectedRoute: Session storage:", {
                user_principal: sessionStorage.getItem('user_principal'),
                openchat_id: sessionStorage.getItem('openchat_id')
            });
            
            setIsAuthenticated(auth);
        };
        checkAuth();
    }, [location]);

    const isBotLogin = sessionStorage.getItem('bot_login_success') === 'true';
    const isDashboardHome = location.pathname === '/dashboard/home';

    if (isAuthenticated === null) {
        console.log("ProtectedRoute: Still checking auth...");
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        if (isBotLogin && isDashboardHome) {
            // Clear the flag after first use for security
            sessionStorage.removeItem('bot_login_success');
            console.log("ProtectedRoute: Allowing /dashboard/home for bot login");
            return <>{children}</>;
        }
        console.log("ProtectedRoute: Not authenticated, redirecting to /dashboard");
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    console.log("ProtectedRoute: Authenticated, rendering children");
    return <>{children}</>;
};

export default ProtectedRoute; 