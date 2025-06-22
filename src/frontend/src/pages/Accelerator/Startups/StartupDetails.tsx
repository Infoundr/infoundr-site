import React from 'react';
import { useParams } from 'react-router-dom';

const StartupDetails: React.FC = () => {
    const { startupId } = useParams<{ startupId: string }>();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Startup Details</h1>
            <p className="mt-2 text-gray-600">Details for startup: {startupId}</p>
        </div>
    );
};

export default StartupDetails; 