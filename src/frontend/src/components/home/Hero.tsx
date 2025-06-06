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

  const handleNavClick = (e: React.MouseEvent<HTMLElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 96; // Height of navbar (24px logo height + padding)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      // setIsMenuOpen(false);
      // setShowFeaturesDropdown(false);
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center">
      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-8 sm:pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 max-w-7xl mx-auto">
          {/* Left Column - Text Content */}
          <div className="flex-1 w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-[56px] font-bold leading-tight mb-6 sm:mb-8 tracking-normal">
              Founders' AI Suite
            </h1>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
              Scale smarter with AI mentors that turn founder wisdom into your competitive advantage. 
              From rapid decision-making to automated workflows, we're your secret weapon for 
              building faster and growing bigger than the competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* <Button variant="primary" className="w-full sm:w-auto px-8" onClick={handleGetStarted}>Get Started Free</Button> */}
              <Button variant="primary" className="w-full sm:w-auto px-8" onClick={(e) => handleNavClick(e, 'features')}>Get Started Free</Button>
              {/* <Button variant="secondary" className="w-full sm:w-auto px-8">Watch Demo</Button> */}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
              {/* Main image */}
              <div className="absolute z-20 transform rotate-[-5deg] shadow-xl">
                <img 
                  src="images/founders.jpg" 
                  alt="AI Assistant" 
                  className="w-full max-w-[250px] lg:max-w-[300px] h-[290px] lg:h-[300px] object-cover rounded-lg"
                />
              </div>
              
              {/* Second image */}
              <div className="absolute z-10 transform translate-x-[-80px] translate-y-[-60px] rotate-[5deg] shadow-xl">
                <img 
                  src="images/founders_2.jpg" 
                  alt="AI Assistant Team" 
                  className="w-full max-w-[220px] lg:max-w-[270px] h-[260px] lg:h-[270px] object-cover rounded-lg"
                />
              </div>
              
              {/* Third image */}
              <div className="absolute transform translate-x-[80px] translate-y-[40px] rotate-[10deg] shadow-xl">
                <img 
                  src="images/founders_3.jpg" 
                  alt="AI Assistant Group" 
                  className="w-full max-w-[220px] lg:max-w-[270px] h-[260px] lg:h-[270px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 