import React from 'react';

const AIPredictions: React.FC = () => {
  const predictions = [
    {
      type: 'Revenue Forecast',
      description: 'Expected 15% growth in Q2 2025 based on current trends',
      iconSrc: '/icons/robot.png'
    },
    {
      type: 'Optimization Tip',
      description: 'Increase marketing spend by 20% to maximize ROI',
      iconSrc: '/icons/bulb.png'
    },
    {
      type: 'Risk Alert',
      description: 'Customer churn rate showing early warning signs',
      iconSrc: '/icons/warning.png'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6">AI Predictions</h2>
      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div key={index} className="bg-[#F9F5FF] p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="bg-[#EDE9FE] p-3 rounded-lg min-w-[40px] flex items-center justify-center">
                <img src={prediction.iconSrc} alt="" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-black">{prediction.type}</h3>
                <p className="text-gray-600 mt-2">{prediction.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIPredictions; 