import React from 'react';
import Card from '../common/Card';

interface Assistant {
  name: string;
  description: string;
  icon: string;
}

const AIAssistants: React.FC = () => {
  const assistants: Assistant[] = [
    {
      name: 'Benny',
      description: 'Your strategic thinking partner for business planning and decision making',
      icon: '/icons/brain.png'
    },
    {
      name: 'Uncle Startups',
      description: 'Expert guidance on startup growth and market analysis',
      icon: '/icons/analytics.png'
    },
    {
      name: 'Dean',
      description: 'Creative problem solving and innovation strategy specialist',
      icon: '/icons/bulb.png'
    }
  ];

  return (
    <section id="ai-assistants" className="ai-assistants py-12 sm:py-16 bg-[#F9FAFB]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          Meet Our AI Assistants
        </h2>
        <p className="text-center text-gray-600 text-base sm:text-lg mb-8 sm:mb-16">
          Specialized bots designed to support every aspect of your business
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {assistants.map((assistant) => (
            <Card key={assistant.name} className="rounded-3xl p-6 sm:p-8">
              <div className="w-12 sm:w-16 h-12 sm:h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <img 
                  src={assistant.icon} 
                  alt={assistant.name} 
                  className="w-6 sm:w-8 h-6 sm:h-8 object-contain"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{assistant.name}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{assistant.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIAssistants; 