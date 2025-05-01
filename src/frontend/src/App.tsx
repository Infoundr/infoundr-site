import React, { useState } from 'react';
import NavBar from './components/layout/NavBar';
import Hero from './components/home/Hero';
import AIAssistants from './components/home/AIAssistants';
import Features from './components/home/Features';
import Pricing from './components/home/Pricing';
import Footer from './components/layout/Footer';
import WaitlistModal from './components/common/WaitlistModal';
import { checkIsAuthenticated } from './services/auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import Auth from './pages/Dashboard/Auth';
import DashboardLayout from './pages/Dashboard/layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BotLogin from './pages/Dashboard/BotLogin';
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Dashboard/layouts/Ideation';
import AIAssistantsPage from './pages/Dashboard/layouts/AIAssistantsPage';

const App: React.FC = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Check initial auth state
  React.useEffect(() => {
    const checkAuth = async () => {
      const auth = await checkIsAuthenticated(); 
      setIsUserAuthenticated(auth);
    };
    checkAuth();
  }, []);

  const handleAuthenticationChange = (status: boolean) => {
    setIsUserAuthenticated(status);
  };

  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={
            <>
              <NavBar 
                onGetStartedClick={() => setIsWaitlistModalOpen(true)} 
                isAuthenticated={isUserAuthenticated}
                onAuthChange={handleAuthenticationChange}
              />
              <main>
                <Hero onGetStartedClick={() => setIsWaitlistModalOpen(true)} />
                <Features />
                <AIAssistants />
                <Pricing />
              </main>
              <Footer />
            </>
          } />

          {/* Auth Route */}
          <Route path="/dashboard" element={<Auth />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="home" element={<Dashboard />} />
            <Route path="ai-assistants" element={<AIAssistantsPage />} />
            <Route path="tasks" element={<div>Tasks Page</div>} />
            <Route path="analytics" element={<div>Analytics Page</div>} />
            <Route path="team" element={<div>Team Page</div>} />
            <Route path="ideation" element={<Ideation />} />
            
          </Route>

          {/* Admin Route */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Bot Login Route */}
          <Route path="/bot-login" element={<BotLogin />} />
        </Routes>

        <WaitlistModal 
          isOpen={isWaitlistModalOpen}
          onClose={() => setIsWaitlistModalOpen(false)}
          onAuthSuccess={() => setIsUserAuthenticated(true)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
