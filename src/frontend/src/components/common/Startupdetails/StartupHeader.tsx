import React from 'react';
import { Mail, Calendar } from 'lucide-react';

interface Props {
  name: string;
}

const StartupHeader: React.FC<Props> = ({ name }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow mb-6">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        {/* Left: Logo + Name + Status */}
        <div className="flex items-center gap-4">
          {/* Proper logo block with word "TechLaunch" */}
          <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-14 h-14 flex items-center justify-center text-xl">
            TL
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="text-sm text-muted-foreground">SaaS • AI-Powered Analytics</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-md">Active</span>
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            <Mail size={16} />
            Contact
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
            <Calendar size={16} />
            Schedule Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartupHeader;


