import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-8 grid grid-cols-4 gap-8">
        <div>
          <img src="/logo.svg" alt="Infoundr" className="mb-4" />
          <p className="text-gray-400">
            Empowering entrepreneurs with AI-powered insights and automation
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Product</h4>
          <ul className="space-y-2">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#api">API</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="#about">About</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#careers">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Subscribe</h4>
          <p className="text-gray-400 mb-4">Stay updated with our latest features and releases</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-800 px-4 py-2 rounded"
            />
            <button className="bg-primary px-4 py-2 rounded">→</button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-8 mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-400">© 2024 Infoundr. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 