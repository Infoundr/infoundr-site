import React from 'react';

const SlackIntegration: React.FC = () => {
  const features = [
    {
      icon: '🧠',
      title: 'Tag Expert Bots',
      description: 'Access specialized AI advisors like @Felix for fundraising or @Nelly for customer insights — get instant, practical advice.'
    },
    {
      icon: '📋',
      title: 'Automate Tasks',
      description: 'Streamline operations with simple Slack commands for CRM creation, sending emails, hiring, follow-ups, and licensing.'
    },
    {
      icon: '🎯',
      title: 'Strategic Insights',
      description: 'Start smart threads with our AI mentors for market analysis, strategy planning, and decision-making support.'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - Features */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Infoundr on Slack
            </h2>
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="text-2xl sm:text-3xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Screenshots */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full max-w-[600px] h-[500px] mx-auto">
              {/* Main screenshot */}
              <div className="absolute z-30 top-0 right-0 w-[80%] transform translate-x-[-5%] rotate-[-2deg] shadow-2xl rounded-lg overflow-hidden">
                <img 
                  src="/images/slack1.jpeg" 
                  alt="Slack Integration Main"
                  className="w-full object-cover"
                />
              </div>
              
              {/* Second screenshot */}
              <div className="absolute z-20 top-[20%] left-0 w-[70%] transform translate-y-[10%] rotate-[3deg] shadow-2xl rounded-lg overflow-hidden">
                <img 
                  src="/images/slack2.jpeg" 
                  alt="Slack Integration Features"
                  className="w-full object-cover"
                />
              </div>
              
              {/* Third screenshot */}
              <div className="absolute z-10 bottom-0 right-[10%] w-[75%] transform translate-y-[-5%] rotate-[-1deg] shadow-2xl rounded-lg overflow-hidden">
                <img 
                  src="/images/slack3.jpeg" 
                  alt="Slack Integration Example"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a 
            target="_blank"
            href="https://slack.infoundr.com/" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
          >
            Add to Slack
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SlackIntegration; 