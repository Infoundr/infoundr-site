import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { checkIsAuthenticated, logout } from '../../services/auth';

interface NavBarProps {
  onGetStartedClick: () => void;
  isAuthenticated: boolean;
  onAuthChange: (status: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onGetStartedClick, isAuthenticated: isUserAuthenticated, onAuthChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    onAuthChange(false);
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
      setIsMenuOpen(false);
      setShowFeaturesDropdown(false);
    }
  };

  const checkAuth = async () => {
    const auth = await checkIsAuthenticated();
    onAuthChange(auth);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-indigo-600">
            <img src="images/Logo.png" alt="Infoundr" className="h-24" />
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a 
            href="#home" 
            onClick={(e) => handleNavClick(e, 'home')}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Home
          </a>
          {/* <a href="#bots" className="text-gray-600 hover:text-gray-900">
            Bots
          </a> */}
          <div className="relative group">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center"
              onMouseEnter={() => setShowFeaturesDropdown(true)}
              onMouseLeave={() => setShowFeaturesDropdown(false)}
            >
              Features
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <div 
              className={`absolute left-0 mt-2 w-48 bg-white/95 backdrop-blur-md shadow-lg rounded-md transition-all duration-200 ease-in-out overflow-hidden z-50
                ${showFeaturesDropdown ? 'opacity-100 max-h-96 visible' : 'opacity-0 max-h-0 invisible'}`}
              onMouseEnter={() => setShowFeaturesDropdown(true)}
              onMouseLeave={() => setShowFeaturesDropdown(false)}
            >
              <a 
                href="#slack-integration" 
                onClick={(e) => handleNavClick(e, 'slack-integration')}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                Try on Slack
              </a>
              <a 
                href="#openchat-integration" 
                onClick={(e) => handleNavClick(e, 'openchat-integration')}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                Try on OpenChat
              </a>
              <a 
                href="#discord-integration" 
                onClick={(e) => handleNavClick(e, 'discord-integration')}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                Try on Discord
              </a>
            </div>
          </div>
          <a 
            href="#pricing" 
            onClick={(e) => handleNavClick(e, 'pricing')}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Pricing
          </a>
          {/* <a href="#contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </a> */}
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center space-x-4">
          {isUserAuthenticated ? (
            <Button 
              variant="primary"
              className="!bg-[#8B5CF6] hover:!bg-[#7C3AED] transition-colors duration-200"
              onClick={handleLogout}
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="primary"
              // onClick={onGetStartedClick}
              onClick={(e) => handleNavClick(e, 'slack-integration')}
              className="transition-colors duration-200"
            >
              Get Started
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`
          md:hidden bg-white/95 backdrop-blur-md border-t shadow-lg
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
          overflow-hidden
        `}
      >
        <div className="px-6 py-4 space-y-4">
          <a 
            href="#home" 
            onClick={(e) => handleNavClick(e, 'home')}
            className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Home
          </a>
          <a 
            href="#features" 
            onClick={(e) => handleNavClick(e, 'features')}
            className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Features
          </a>
          <div className="pl-4 space-y-2">
            <a 
              href="#slack-integration" 
              onClick={(e) => handleNavClick(e, 'slack-integration')}
              className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              - Try on Slack
            </a>
            <a 
              href="#openchat-integration" 
              onClick={(e) => handleNavClick(e, 'openchat-integration')}
              className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              - Try on OpenChat
            </a>
            <a 
              href="#discord-integration" 
              onClick={(e) => handleNavClick(e, 'discord-integration')}
              className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              - Try on Discord
            </a>
          </div>
          <a 
            href="#pricing" 
            onClick={(e) => handleNavClick(e, 'pricing')}
            className="block text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Pricing
          </a>
          {/* <a href="#contact" className="block text-gray-600 hover:text-gray-900">
            Contact
          </a> */}
          <div className="pt-4">
            {isUserAuthenticated ? (
              <Button 
                variant="primary"
                className="w-full !bg-[#8B5CF6] hover:!bg-[#7C3AED] transition-colors duration-200"
                onClick={handleLogout}
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                variant="primary" 
                className="w-full transition-colors duration-200"
                onClick={(e) => handleNavClick(e, 'slack-integration')}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 