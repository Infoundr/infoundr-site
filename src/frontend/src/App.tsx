import React, { useState } from 'react';
import NavBar from './components/layout/NavBar';
import Hero from './components/home/Hero';
import AIAssistants from './components/home/AIAssistants';
import Features from './components/home/Features';
import Pricing from './components/home/Pricing';
import Footer from './components/layout/Footer';
import WaitlistModal from './components/common/WaitlistModal';
import { isAuthenticated } from './services/auth';

const App: React.FC = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Check initial auth state
  React.useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsUserAuthenticated(auth);
    };
    checkAuth();
  }, []);

  const handleAuthenticationChange = (status: boolean) => {
    setIsUserAuthenticated(status);
  };

  return (
    <div className="relative">
      <NavBar 
        onGetStartedClick={() => setIsWaitlistModalOpen(true)} 
        isAuthenticated={isUserAuthenticated}
        onAuthChange={handleAuthenticationChange}
      />
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
        onAuthSuccess={() => setIsUserAuthenticated(true)}
      />
    </div>
  );
};

export default App; 