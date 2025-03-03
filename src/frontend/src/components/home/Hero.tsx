import React from 'react';
import Button from '../common/Button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Content Container */}
      <div className="container mx-auto px-6 pt-32 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column - Text Content */}
        <div className="flex-1 text-left max-w-xl">
          <h1 className="text-4xl lg:text-[56px] font-bold leading-tight mb-6 text-center lg:text-left">
            Your Personal Board of AI Advisors
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl mb-8 max-w-xl text-center lg:text-left">
            Meet Infoundr - a suite of AI-powered bots modeled after successful entrepreneurs. 
            Get personalized guidance on critical thinking, innovation, and business strategy 
            from AI assistants that understand your unique challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button variant="primary" className="w-full sm:w-auto">Get Started Free</Button>
            <Button variant="secondary" className="w-full sm:w-auto">Watch Demo</Button>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative w-full lg:w-1/2">
          <img 
            src="images/Hero.png" 
            alt="AI Assistant" 
            className="w-full h-full object-contain max-w-[300px] mx-auto lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero; 