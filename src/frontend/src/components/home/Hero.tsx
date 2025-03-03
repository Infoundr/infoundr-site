import React from 'react';
import Button from '../common/Button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Content Container */}
      <div className="container mx-auto px-6 pt-32 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column - Text Content */}
        <div className="flex-1 text-left max-w-xl">
          <h1 className="text-[56px] font-bold leading-tight mb-6">
            Your Personal Board of AI Advisors
          </h1>
          <p className="text-gray-600 text-xl mb-8 max-w-xl">
            Meet Infoundr - a suite of AI-powered bots modeled after successful entrepreneurs. 
            Get personalized guidance on critical thinking, innovation, and business strategy 
            from AI assistants that understand your unique challenges.
          </p>
          <div className="flex gap-4">
            <Button variant="primary">Get Started Free</Button>
            <Button variant="secondary">Watch Demo</Button>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative w-1/2">
          <img 
            src="images/Hero.png" 
            alt="AI Assistant" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

    </section>
  );
};

export default Hero; 