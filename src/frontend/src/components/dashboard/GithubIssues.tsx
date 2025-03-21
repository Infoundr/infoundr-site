import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../services/auth';
import { _SERVICE } from "../../../../declarations/backend/backend.did";

interface Props {
    actor: _SERVICE;
}

const GithubIssues: React.FC<Props> = ({ actor }) => {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const user = await getCurrentUser();
                if (user && user[0]) {
                    // First try to get OpenChat user by principal
                    const openchatUser = await actor.get_openchat_user_by_principal(user[0].principal);
                    
                    if (openchatUser && openchatUser.length > 0) {
                        // If we found a linked OpenChat user, use UserIdentifier.OpenChatId
                        const userActivity = await actor.get_user_activity({
                            OpenChatId: openchatUser[0].openchat_id
                        });
                        setIssues(userActivity.issues);
                    } else {
                        // If no linked OpenChat user, try with Principal
                        const userActivity = await actor.get_user_activity({
                            Principal: user[0].principal
                        });
                        setIssues(userActivity.issues);
                    }
                }
            } catch (error) {
                console.error('Error fetching issues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [actor]);

    if (loading) return <div>Loading issues...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">GitHub Issues</h2>
            <div className="space-y-4">
                {issues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{issue.title}</h3>
                        <p className="text-gray-600 mt-1">{issue.description}</p>
                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                Created: {new Date(Number(issue.created_at) / 1_000_000).toLocaleDateString()}
                            </span>
                            <a 
                                href={issue.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800"
                            >
                                View on GitHub →
                            </a>
                        </div>
                    </div>
                ))}
                {issues.length === 0 && (
                    <p className="text-gray-500 text-center">No issues found</p>
                )}
            </div>
        </div>
    );
};

export default GithubIssues; 