import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../services/auth';
import { _SERVICE } from "../../../../../declarations/backend/backend.did";
import { mockGithubIssues, useMockData as mockDataBoolean } from '../../../mocks/mockData';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Props {
    actor: _SERVICE;
    useMockData?: boolean;
}

const GithubIssues: React.FC<Props> = ({ actor, useMockData = mockDataBoolean }) => {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                if (useMockData) {
                    console.log("Using mock data directly for GitHub issues");
                    setIssues(mockGithubIssues);
                    setLoading(false);
                    return;
                }

                const user = await getCurrentUser();
                if (user && user[0]) {
                    const userIssues = await actor.get_user_issues({
                        Principal: user[0].principal
                    });
                    setIssues(userIssues);
                }
            } catch (error) {
                console.error('Error fetching issues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [actor, useMockData]);

    console.log("Current issues state:", issues);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        GitHub Issues
                    </span>
                </h2>
                <div className="bg-purple-50 rounded-full px-4 py-2 text-sm text-purple-700 font-medium">
                    {issues.length} Open Issues
                </div>
            </div>

            <div className="space-y-6">
                {issues.map((issue) => (
                    <div 
                        key={issue.id} 
                        className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-white to-gray-50"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg text-gray-800">{issue.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        issue.status === 'Open' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {issue.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 leading-relaxed">{issue.body}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="text-sm text-gray-600">
                                        Created: {new Date(Number(issue.created_at) / 1_000_000).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                                    </svg>
                                    <span className="text-sm text-gray-600">
                                        {issue.repository}
                                    </span>
                                </div>
                            </div>
                            <a 
                                href={issue.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors duration-150"
                            >
                                <span>View on GitHub</span>
                                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                ))}
                {issues.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <p className="text-gray-500 text-lg">No GitHub issues found</p>
                        <p className="text-gray-400 text-sm mt-2">Connect your GitHub repository to see issues here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GithubIssues; 