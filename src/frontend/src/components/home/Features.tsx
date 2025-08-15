import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      title: 'GitHub Automation',
      description: 'Manage repositories, create issues, track pull requests, and automate development workflows',
      icon: '/icons/gear.png',
      status: 'current'
    },
    {
      title: 'Project Management',
      description: 'Create tasks, manage workflows, assign responsibilities, and track project progress',
      icon: '/icons/tasks.png',
      status: 'current'
    },
    {
      title: 'Calendar Management',
      description: 'Schedule meetings, set reminders, manage appointments, and coordinate team availability',
      icon: '/icons/clock.png',
      status: 'current'
    },
    {
      title: 'Email Automation',
      description: 'Draft emails, create templates, automate outreach, and manage communication workflows',
      icon: '/icons/mail.png',
      status: 'current'
    },
    {
      title: 'Contract Review & Legal',
      description: 'AI-powered contract analysis, legal compliance checks, and IP tracking automation',
      icon: '/icons/check.png',
      status: 'coming-soon'
    },
    {
      title: 'Financial Reporting & Bookkeeping',
      description: 'Automated bookkeeping, financial insights, tax compliance, and reporting workflows',
      icon: '/icons/piechart.png',
      status: 'coming-soon'
    },
    {
      title: 'Investor Relations & Deal Rooms',
      description: 'Create deal rooms, manage investor updates, and automate fundraising workflows',
      icon: '/icons/rocket.png',
      status: 'coming-soon'
    },
    {
      title: 'Hiring & HR Workflows',
      description: 'Automate job creation, candidate screening, onboarding, and team management',
      icon: '/icons/people.png',
      status: 'coming-soon'
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
        
        {/* Current Features */}
        <div className="mb-12">
          <h3 className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
            Available Now
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 px-4 sm:px-8">
            {features.filter(f => f.status === 'current').map((feature) => (
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

        {/* Coming Soon Features */}
        <div>
          <h3 className="text-center text-xl sm:text-2xl font-semibold text-gray-600 mb-6">
            Coming Soon
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 px-4 sm:px-8">
            {features.filter(f => f.status === 'coming-soon').map((feature) => (
              <div key={feature.title} className="flex items-start gap-6 p-4 relative">
                <div className="absolute top-2 right-2">
                  <span className="inline-block px-2 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-medium">
                    Coming Soon
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={feature.icon} 
                    alt={feature.title}
                    className="w-8 sm:w-10 h-8 sm:h-10 object-contain opacity-60"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-500">{feature.title}</h3>
                  <p className="text-gray-500 text-base sm:text-lg">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 