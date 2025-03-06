import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      title: 'Bot Management',
      description: 'Easily manage and customize your AI assistants to match your business needs',
      icon: '/icons/robot.png'
    },
    {
      title: 'Task Automation',
      description: 'Automate repetitive tasks and workflows to save time and resources',
      icon: '/icons/gear.png'
    },
    {
      title: 'Critical Thinking',
      description: 'Advanced AI algorithms for strategic decision-making and problem-solving',
      icon: '/icons/brain.png'
    },
    {
      title: 'Analytics & Insights',
      description: 'Comprehensive data analysis and actionable business insights',
      icon: '/icons/piechart.png'
    }
  ];

  return (
    <section id="features" className="py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          Powerful Features
        </h2>
        <p className="text-center text-gray-600 text-base sm:text-lg mb-8 sm:mb-12">
          Everything you need to scale your startup
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 px-4 sm:px-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-6 p-4">
              <div className="flex-shrink-0">
                <img 
                  src={feature.icon} 
                  alt={feature.title}
                  className="w-8 sm:w-10 h-8 sm:h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-base sm:text-lg">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 