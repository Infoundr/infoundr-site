import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../services/auth';
import { _SERVICE } from "../../../../declarations/backend/backend.did";

interface Props {
    actor: _SERVICE;
}

const TaskList: React.FC<Props> = ({ actor }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const user = await getCurrentUser();
                if (user && user[0]) {
                    // Use get_user_tasks with UserIdentifier.Principal
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
    }, [actor]);

    if (loading) return <div>Loading tasks...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Project Management</h2>
            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                Due: {new Date(Number(task.due_date) / 1_000_000).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm ${
                                task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {task.status}
                            </span>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <p className="text-gray-500 text-center">No tasks found</p>
                )}
            </div>
        </div>
    );
};

export default TaskList; 