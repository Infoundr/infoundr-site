import React from 'react';
import Button from '../common/Button';

const AIRecommendations: React.FC = () => {
  const recommendations = [
    {
      icon: '💡',
      text: 'Optimize email campaign scheduling based on engagement patterns'
    },
    {
      icon: '📊',
      text: 'Generate monthly performance reports automatically'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <h2 className="text-xl font-semibold">AI Recommendations</h2>
        </div>
        <Button variant="secondary" className="text-sm">
          Apply All
        </Button>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-xl mt-1">{rec.icon}</span>
            <p className="text-gray-700">{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations; 