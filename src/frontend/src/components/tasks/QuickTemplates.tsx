import React from 'react';

const QuickTemplates: React.FC = () => {
  const templates = [
    {
      name: 'Follow-up Email',
      description: 'Automated follow-up sequence',
      icon: '✉️'
    },
    {
      name: 'Pitch Deck',
      description: 'Generate presentation',
      icon: '📊'
    },
    {
      name: 'Analytics Report',
      description: 'Weekly performance summary',
      icon: '📈'
    },
    {
      name: 'Custom Template',
      description: 'Create new template',
      icon: '➕',
      isAdd: true
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Quick Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl p-6 shadow-sm cursor-pointer transition-all hover:shadow-md ${
              template.isAdd ? 'border-2 border-dashed border-gray-300' : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-gray-600 text-sm">{template.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickTemplates; 