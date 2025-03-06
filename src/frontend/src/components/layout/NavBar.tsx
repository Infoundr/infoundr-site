import React, { useState } from 'react';
import Button from '../common/Button';

interface NavBarProps {
  onGetStartedClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onGetStartedClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-indigo-600">
            <img src="images/Logo.png" alt="Infoundr" className="h-24" />
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-gray-600 hover:text-gray-900">
            Home
          </a>
          <a href="#bots" className="text-gray-600 hover:text-gray-900">
            Bots
          </a>
          <a href="#features" className="text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </a>
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <Button 
            variant="primary"
            onClick={onGetStartedClick}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
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
          md:hidden bg-white border-t
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible h-0'}
        `}
      >
        <div className="px-6 py-4 space-y-4">
          <a href="#home" className="block text-gray-600 hover:text-gray-900">
            Home
          </a>
          <a href="#bots" className="block text-gray-600 hover:text-gray-900">
            Bots
          </a>
          <a href="#features" className="block text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#pricing" className="block text-gray-600 hover:text-gray-900">
            Pricing
          </a>
          <a href="#contact" className="block text-gray-600 hover:text-gray-900">
            Contact
          </a>
          <div className="pt-4">
            <Button 
              variant="primary" 
              className="w-full"
              onClick={onGetStartedClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 