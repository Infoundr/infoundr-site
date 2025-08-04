import React, { useState } from 'react';
import NavBar from './components/layout/NavBar';
import Hero from './components/home/Hero';
// import AIAssistants from './components/home/AIAssistants';
import Features from './components/home/Features';
import SlackIntegration from './components/home/SlackIntegration';
import OpenChatIntegration from './components/home/OpenChatIntegration';
import DiscordIntegration from './components/home/DiscordIntegration';
import Pricing from './components/home/Pricing';
import Footer from './components/layout/Footer';
import WaitlistModal from './components/common/WaitlistModal';
import { checkIsAuthenticated } from './services/auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminPanel from './pages/AdminPanel';
import Auth from './pages/Dashboard/Auth';
import DashboardLayout from './pages/Dashboard/layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BotLogin from './pages/Dashboard/BotLogin';
import Ideation from './pages/Dashboard/layouts/Ideation';
import AIAssistantsPage from './pages/Dashboard/layouts/AIAssistantsPage';
import GithubIssues from './pages/Dashboard/layouts/GithubIssues';
import AcceleratorLayout from './pages/Accelerator/AcceleratorLayout';
import AcceleratorDashboard from './pages/Accelerator/Dashboard/Dashboard';
import Startups from './pages/Accelerator/Startups/Startups';
import StartupDetails from './pages/Accelerator/Startups/StartupDetails';
import SendInvites from './pages/Accelerator/Invites/SendInvites';
import RolesPermissions from './pages/Accelerator/Roles/RolesPermissions';
import Settings from './pages/Accelerator/Settings/Settings';
import Analytics from './pages/Accelerator/Analytics/Analytics';
import StartupsLayout from './pages/Accelerator/Startups/StartupsLayout';
import StartupDetailsLayout from './pages/Accelerator/Startups/StartupDetailsLayout';
import StartupSignup from './pages/Accelerator/Invites/StartupSignup';
import AcceleratorLogin from './pages/Accelerator/Auth/Login';
import { _SERVICE } from '../../declarations/backend/backend.did';
import { useMockData as mockDataBoolean } from './mocks/mockData';
import { Actor } from '@dfinity/agent';
import StartupInviteAccept from './pages/Accelerator/Invites/StartupSignup';
import TeamInviteAccept from './pages/Accelerator/Invites/TeamInviteAccept';

const App: React.FC = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [actor, setActor] = useState<Actor | null>(null);

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
        <ToastContainer position="top-right" autoClose={3000} />
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
                <SlackIntegration />
                <DiscordIntegration />
                <OpenChatIntegration />
                {/* <AIAssistants /> */}
                <Pricing onGetStartedClick={() => setIsWaitlistModalOpen(true)} />
              </main>
              <Footer />
            </>
          } />

          {/* Auth Route */}
          <Route path="/dashboard" element={<Auth />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />

          {/* Accelerator Routes */}
          <Route path="/accelerator" element={
            <ProtectedRoute>
              <AcceleratorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/accelerator/dashboard" replace />} />
            <Route path="dashboard" element={<AcceleratorDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="invites" element={<SendInvites />} />
            <Route path="invites/generate-invite" element={<StartupSignup />} />
            <Route path="invite/:invite-code" element={<StartupInviteAccept />} />
            <Route path="roles" element={<RolesPermissions />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/accelerator/startups" element={
            <ProtectedRoute>
              <StartupsLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Startups />} />
          </Route>

          <Route path="/accelerator/startups/:startupId" element={
            <ProtectedRoute>
              <StartupDetailsLayout />
            </ProtectedRoute> 
          }>
            <Route index element={<StartupDetails />} />
          </Route>

          <Route path="/accelerator/login" element={<AcceleratorLogin />} />

          <Route path="/accelerator/roles/invite/:token" element={<TeamInviteAccept />} />

          {/* BotLogin route outside of dashboard */}
          <Route path="/bot-login" element={<BotLogin />} />

          {/* Add AdminPanel route outside of dashboard */}
          <Route path="/admin" element={<AdminPanel />} />
          
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
