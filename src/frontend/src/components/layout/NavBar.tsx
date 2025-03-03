import React from 'react';
import Button from '../common/Button';

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-indigo-600">
            <img src="images/Logo.png" alt="Infoundr" className="h-24" />
          </a>
        </div>

        {/* Navigation Links */}
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

        {/* CTA Button */}
        <div>
          <Button variant="primary">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 