import React, { useState } from 'react';
import NavBar from './components/layout/NavBar';
import Hero from './components/home/Hero';
import AIAssistants from './components/home/AIAssistants';
import Features from './components/home/Features';
import Pricing from './components/home/Pricing';
import Footer from './components/layout/Footer';
import WaitlistModal from './components/common/WaitlistModal';

const App: React.FC = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  return (
    <div className="relative">
      <NavBar onGetStartedClick={() => setIsWaitlistModalOpen(true)} />
      <main>
        <Hero />
        <AIAssistants />
        <Features />
        <Pricing />
      </main>
      <Footer />
      <WaitlistModal 
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
      />
    </div>
  );
};

export default App; 