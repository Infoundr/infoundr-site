import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear(); // Get the current year

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <img 
              src="/images/Logo.png" 
              alt="Infoundr" 
              className="h-12 sm:h-16 mb-4 mx-auto sm:mx-0" 
            />
            <p className="text-gray-400 text-sm sm:text-base">
              Empowering entrepreneurs with AI-powered insights and automation
            </p>
          </div>

          {/* Product Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-bold mb-4 text-lg">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              {/* <li><a href="#api" className="text-gray-400 hover:text-white transition-colors">API</a></li> */}
            </ul>
          </div>

          {/* Company Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-bold mb-4 text-lg">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center sm:text-left">
            <h4 className="font-bold mb-4 text-lg">Subscribe</h4>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Stay updated with our latest features and releases
            </p>
            <div className="flex gap-2 max-w-xs mx-auto sm:mx-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 px-4 py-2 rounded flex-1 text-sm sm:text-base"
              />
              <button className="bg-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center sm:text-left">
          <p className="text-gray-400 text-sm">&copy; {currentYear} Infoundr. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 