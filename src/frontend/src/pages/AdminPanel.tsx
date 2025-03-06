import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backend } from "../../../declarations/backend";
import { User, WaitlistEntry } from "../../../declarations/backend/backend.did";
import { loginWithII, loginWithNFID, checkIsAuthenticated } from '../services/auth';

const AdminPanel: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const auth = await checkIsAuthenticated();
        setIsAuthenticated(auth);
        if (auth) {
            checkAdminStatus();
        }
        setLoading(false);
    };

    const checkAdminStatus = async () => {
        try {
            const isAdminUser = await backend.is_admin();
            setIsAdmin(isAdminUser);
            if (isAdminUser) {
                await fetchData();
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const handleLogin = async (method: 'ii' | 'nfid') => {
        try {
            if (method === 'ii') {
                await loginWithII();
            } else {
                await loginWithNFID();
            }
            await checkAuthStatus();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const fetchData = async () => {
        try {
            const [usersResult, waitlistResult] = await Promise.all([
                backend.get_users(),
                backend.get_waitlist()
            ]);

            if ('Ok' in usersResult) setUsers(usersResult.Ok);
            if ('Ok' in waitlistResult) setWaitlist(waitlistResult.Ok);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Admin Authentication</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => handleLogin('ii')}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            Login with Internet Identity
                        </button>
                        <button
                            onClick={() => handleLogin('nfid')}
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                        >
                            Login with NFID
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
                    <p className="text-gray-600">You do not have admin privileges.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
            
            {/* Users Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.principal.toString()}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.principal.toString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(Number(user.created_at) / 1000000).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Waitlist Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Waitlist Entries</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {waitlist.map((entry) => (
                                <tr key={entry.email}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {Object.keys(entry.status)[0]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(Number(entry.created_at) / 1000000).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminPanel; 