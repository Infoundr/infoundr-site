import React from 'react';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onGetStartedClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStartedClick }) => {

  const handleGetStarted = () => {
    onGetStartedClick();
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center">
      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-8 sm:pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 max-w-7xl mx-auto">
          {/* Left Column - Text Content */}
          <div className="flex-1 w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-[56px] font-bold leading-tight mb-4 sm:mb-6">
              Your Personal Board of AI Advisors
            </h1>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8">
              Meet Infoundr - a suite of AI-powered bots modeled after successful entrepreneurs. 
              Get personalized guidance on critical thinking, innovation, and business strategy 
              from AI assistants that understand your unique challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="primary" className="w-full sm:w-auto px-8" onClick={handleGetStarted}>Get Started Free</Button>
              <Button variant="secondary" className="w-full sm:w-auto px-8">Watch Demo</Button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <img 
              src="images/Hero.png" 
              alt="AI Assistant" 
              className="w-full max-w-[300px] lg:max-w-[400px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 