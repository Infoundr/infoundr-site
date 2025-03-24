import React from 'react';
import Button from '../common/Button';

const AIRecommendations: React.FC = () => {
  const recommendations = [
    {
      iconSrc: '/icons/bulb.png',
      text: 'Optimize email campaign scheduling based on engagement patterns'
    },
    {
      iconSrc: '/icons/metrics.png',
      text: 'Generate monthly performance reports automatically'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#EDE9FE] p-3 rounded-lg">
            <img src="/icons/robot.png" alt="" className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold">AI Recommendations</h2>
        </div>
        <Button variant="secondary" className="text-sm">
          Apply All
        </Button>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="bg-[#EDE9FE] p-3 rounded-lg">
              <img src={rec.iconSrc} alt="" className="w-6 h-6" />
            </div>
            <p className="text-gray-700 mt-2">{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations; 