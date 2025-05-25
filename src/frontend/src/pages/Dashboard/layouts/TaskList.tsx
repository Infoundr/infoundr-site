import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../services/auth';
import { _SERVICE } from "../../../../../declarations/backend/backend.did";
import { mockTasks } from '../../../mocks/mockData';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Props {
    actor: _SERVICE;
    useMockData?: boolean;
}

const TaskList: React.FC<Props> = ({ actor, useMockData = true }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                if (useMockData) {
                    console.log("Using mock data directly for tasks");
                    setTasks(mockTasks);
                    setLoading(false);
                    return;
                }

                const user = await getCurrentUser();
                const platform = sessionStorage.getItem('platform');
                const slackId = sessionStorage.getItem('slack_id');
                const openchatId = sessionStorage.getItem('openchat_id');

                if (platform === 'slack' && slackId) {
                    // For Slack users, use their Slack ID
                    const userTasks = await actor.get_user_tasks({
                        SlackId: slackId
                    });
                    setTasks(userTasks);
                } else if (user && user[0]) {
                    // For OpenChat users, use their principal
                    const userTasks = await actor.get_user_tasks({
                        Principal: user[0].principal
                    });
                    setTasks(userTasks);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [actor, useMockData]);

    console.log("Current tasks state:", tasks);

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
                        Project Management
                    </span>
                </h2>
                <div className="bg-purple-50 rounded-full px-4 py-2 text-sm text-purple-700 font-medium">
                    {tasks.length} Active Tasks
                </div>
            </div>

            <div className="space-y-6">
                {tasks.map((task) => (
                    <div 
                        key={task.id} 
                        className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-white to-gray-50"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">{task.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{task.description}</p>
                            </div>
                            <span className={`ml-4 px-4 py-1.5 rounded-full text-sm font-medium ${
                                task.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : task.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                            </span>
                        </div>

                        <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-sm text-gray-600">
                                    Due: {new Date(Number(task.due_date) / 1_000_000).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                                <span className="text-sm text-gray-600">
                                    {task.platform}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <p className="text-gray-500 text-lg">No tasks found</p>
                        <p className="text-gray-400 text-sm mt-2">Tasks from connected platforms will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskList; 