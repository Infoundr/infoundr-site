import React from 'react';

const AIPredictions: React.FC = () => {
  const predictions = [
    {
      type: 'Revenue Forecast',
      description: 'Expected 15% growth in Q2 2025 based on current trends',
      icon: '🤖'
    },
    {
      type: 'Optimization Tip',
      description: 'Increase marketing spend by 20% to maximize ROI',
      icon: '💡'
    },
    {
      type: 'Risk Alert',
      description: 'Customer churn rate showing early warning signs',
      icon: '⚠️'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">AI Predictions</h2>
      </div>
      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div key={index} className="bg-[#F9F5FF] p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{prediction.icon}</span>
              <h3 className="font-medium text-[#7C3AED]">{prediction.type}</h3>
            </div>
            <p className="text-gray-600 text-sm">{prediction.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIPredictions; 