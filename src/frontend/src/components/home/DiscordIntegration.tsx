import React from 'react';

const DiscordIntegration: React.FC = () => {
  const features = [
    {
      icon: '🎮',
      title: 'Server Integration',
      description: 'Add your AI co-founder to any Discord server for seamless team collaboration and automation.'
    },
    {
      icon: '⚡',
      title: 'Instant Access',
      description: 'Get immediate AI assistance through slash commands and mentions in your Discord channels.'
    },
    {
      icon: '🤖',
      title: 'Smart Automation',
      description: 'Automate workflows and get AI-powered insights directly in your Discord conversations.'
    }
  ];

  return (
    <section id="discord-integration" className="py-16 sm:py-20 bg-gradient-to-b from-purple-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 max-w-7xl mx-auto">
          
          {/* Left Column - Image */}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
              {/* Main image */}
              <div className="absolute z-30 transform rotate-[-2deg] shadow-xl">
                <img 
                  src="/images/discord1.png" 
                  alt="Discord Integration Main"
                  className="w-full max-w-[250px] lg:max-w-[300px] h-[290px] lg:h-[300px] object-cover rounded-lg"
                />
              </div>
              
              {/* Second image */}
              <div className="absolute z-20 transform translate-x-[-80px] translate-y-[-60px] rotate-[3deg] shadow-xl">
                <img 
                  src="/images/discord2.png" 
                  alt="Discord Integration Features"
                  className="w-full max-w-[220px] lg:max-w-[270px] h-[260px] lg:h-[270px] object-cover rounded-lg"
                />
              </div>
              
              {/* Third image */}
              <div className="absolute z-10 transform translate-x-[80px] translate-y-[40px] rotate-[-1deg] shadow-xl">
                <img 
                  src="/images/discord3.png" 
                  alt="Discord Integration Example"
                  className="w-full max-w-[220px] lg:max-w-[270px] h-[260px] lg:h-[270px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="flex-1 w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Try Your AI Co-Founder in Discord
            </h2>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 sm:gap-4 items-start">
                  <div className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0 mt-1">
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
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <a 
            href="/documentation/discord" 
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
          >
            Try on Discord
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default DiscordIntegration;
