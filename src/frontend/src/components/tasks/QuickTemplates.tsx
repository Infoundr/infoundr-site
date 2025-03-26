import React from 'react';

const QuickTemplates: React.FC = () => {
  const templates = [
    {
      name: 'Follow-up Email',
      description: 'Automated follow-up sequence',
      iconSrc: '/icons/mail.png'
    },
    {
      name: 'Pitch Deck',
      description: 'Generate pitch deck from template',
      iconSrc: '/icons/presentation.png'
    },
    {
      name: 'Analytics Report',
      description: 'Weekly performance analytics',
      iconSrc: '/icons/chart.png'
    },
    {
      name: 'Custom Template',
      description: 'Create your own template',
      iconSrc: '/icons/plus.png',
      isAdd: true
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#EDE9FE] p-3 rounded-lg">
          <img src="/icons/template.png" alt="" className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold">Quick Templates</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 cursor-pointer hover:border-purple-300 transition-colors ${
              template.isAdd ? 'border-dashed' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="bg-[#EDE9FE] p-3 rounded-lg">
                <img src={template.iconSrc} alt="" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickTemplates; 