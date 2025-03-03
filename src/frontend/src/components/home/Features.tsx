import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      title: 'Bot Management',
      description: 'Easily manage and customize your AI assistants to match your business needs',
      icon: '🤖'
    },
    {
      title: 'Task Automation',
      description: 'Automate repetitive tasks and workflows to save time and resources',
      icon: '⚙️'
    },
    {
      title: 'Critical Thinking',
      description: 'Advanced AI algorithms for strategic decision-making and problem-solving',
      icon: '🧠'
    },
    {
      title: 'Analytics & Insights',
      description: 'Comprehensive data analysis and actionable business insights',
      icon: '📊'
    }
  ];

  return (
    <section className="py-16">
      <h2 className="text-center text-3xl font-bold mb-4">Powerful Features</h2>
      <p className="text-center mb-12">Everything you need to scale your startup</p>
      <div className="grid grid-cols-2 gap-8 px-8">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-4">
            <div className="text-3xl">{feature.icon}</div>
            <div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features; 