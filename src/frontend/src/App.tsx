import React, { useState } from 'react';
import NavBar from './components/layout/NavBar';
import Hero from './components/home/Hero';
// import AIAssistants from './components/home/AIAssistants';
import Features from './components/home/Features';
import SlackIntegration from './components/home/SlackIntegration';
import DiscordIntegration from './components/home/DiscordIntegration';
import Pricing from './components/home/Pricing';
import Footer from './components/layout/Footer';
import WaitlistModal from './components/common/WaitlistModal';
import GetStartedModal from './components/common/GetStartedModal';
import PlaygroundChatModal from './components/common/PlaygroundChatModal';
import PlaygroundChatButton from './components/common/PlaygroundChatButton';
import { checkIsAuthenticated } from './services/auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminWaitlist from './pages/Admin/Waitlist';
import UserUsage from './pages/Admin/UserUsage';
import AdminAdmins from './pages/Admin/Admins';
import AdminAccelerators from './pages/Admin/Accelerators';
import AdminPlatformUsers from './pages/Admin/PlatformUsers';
import AdminApiMessages from './pages/Admin/ApiMessages';
import AdminPlaygroundMonitoring from './pages/Admin/PlaygroundMonitoring';
import PaymentManagement from './pages/Admin/PaymentManagement';
import Auth from './pages/Dashboard/Auth';
import DashboardLayout from './pages/Dashboard/layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WorkspaceLinking from './pages/Dashboard/BotLogin';
import Ideation from './pages/Dashboard/layouts/Ideation';
import AIAssistantsPage from './pages/Dashboard/layouts/AIAssistantsPage';
import GithubIssues from './pages/Dashboard/layouts/GithubIssues';
import AcceleratorLayout from './pages/Accelerator/AcceleratorLayout';
import AcceleratorDashboard from './pages/Accelerator/Dashboard/Dashboard';
import Startups from './pages/Accelerator/Startups/Startups';
import StartupDetails from './pages/Accelerator/Startups/StartupDetails';
import SendInvites from './pages/Accelerator/Invites/SendInvites';
import RolesPermissions from './pages/Accelerator/Roles/RolesPermissions';
import TeamInviteAccept from "./pages/Accelerator/Roles/TeamInviteAccept";

import Settings from './pages/Accelerator/Settings/Settings';
import Analytics from './pages/Accelerator/Analytics/Analytics';
import StartupsLayout from './pages/Accelerator/Startups/StartupsLayout';
import StartupDetailsLayout from './pages/Accelerator/Startups/StartupDetailsLayout';
import StartupSignup from './pages/Accelerator/Invites/StartupSignup';
import StartupAuth from './pages/Accelerator/Invites/StartupAuth';
import AcceleratorLogin from './pages/Accelerator/Auth/Login';
import { _SERVICE } from '../../declarations/backend/backend.did';
import { useMockData as mockDataBoolean } from './mocks/mockData';
import { Actor } from '@dfinity/agent';
import StartupInviteAccept from './pages/Accelerator/Invites/StartupSignup';
import Documentation from './pages/documentation/Documentation';
import SlackDoc from './pages/documentation/slack/SlackDoc';
import SlackLayout from "./pages/documentation/slack/SlackLayout";
import SlackGithubAgent from "./pages/documentation/slack/SlackGithubAgent";
import SlackProjectManagementAgent from "./pages/documentation/slack/SlackProjectManagementAgent";
import SlackCalendarAgent from "./pages/documentation/slack/SlackCalendarAgent";
import SlackEmailAgent from "./pages/documentation/slack/SlackEmailAgent";
import OpenChatDoc from './pages/documentation/OpenChatDoc';
import DiscordLayout from './pages/documentation/DiscordLayout';
import GitHubAgent from './pages/documentation/discord/GitHubAgent';
import ProjectManagementAgent from './pages/documentation/discord/ProjectManagementAgent';
import CalendarAgent from './pages/documentation/discord/CalendarAgent';
import EmailAgent from './pages/documentation/discord/EmailAgent';
import PaymentCallback from './pages/PaymentCallback';
import PaymentCheckout from './pages/PaymentCheckout';


const App: React.FC = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);
  const [isPlaygroundModalOpen, setIsPlaygroundModalOpen] = useState(false);
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

  const handleGetStartedClick = () => {
    setIsGetStartedModalOpen(true);
  };

  const handleTryPlayground = () => {
    setIsGetStartedModalOpen(false);
    setIsPlaygroundModalOpen(true);
  };

  const handleViewDocumentation = () => {
    setIsGetStartedModalOpen(false);
    // Navigate to documentation page
    window.location.href = '/documentation';
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
                onGetStartedClick={handleGetStartedClick} 
                isAuthenticated={isUserAuthenticated}
                onAuthChange={handleAuthenticationChange}
              />
              <main>
                <Hero onGetStartedClick={handleGetStartedClick} />
                <Features />
                <SlackIntegration />
                <DiscordIntegration />
                {/* <AIAssistants /> */}
                <Pricing onGetStartedClick={handleGetStartedClick} />
              </main>
              <Footer />
            </>
          } />

          {/* Auth Route */}
          <Route path="/dashboard" element={<Auth />} />

          {/* Payment Routes */}
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/payment/checkout" element={
            <ProtectedRoute>
              <PaymentCheckout />
            </ProtectedRoute>
          } />

          {/* Public invite accept route (not protected) - must be before other /accelerator routes */}
          <Route path="/accelerator/invite/:inviteCode/*" element={<StartupInviteAccept />} />

          {/* Public startup authentication route (not protected) */}
          <Route path="/accelerator/auth" element={<StartupAuth />} />



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
            <Route path="roles" element={<RolesPermissions />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
            {/* ✅ Standalone invite accept page (no dashboard layout) */}
            <Route path="/accelerator/team-invite/:token" element={<TeamInviteAccept />} />

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

          {/* BotLogin route outside of dashboard */}
          <Route path="/auth/link" element={<WorkspaceLinking />} />

          {/* Team invite accept route - accessible without authentication */}
          <Route path="/accelerator/roles/invite/:token" element={<TeamInviteAccept />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="waitlist" element={<AdminWaitlist />} />
            <Route path="user-usage" element={<UserUsage />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="admins" element={<AdminAdmins />} />
            <Route path="accelerators" element={<AdminAccelerators />} />
            <Route path="platform-users" element={<AdminPlatformUsers />} />
            <Route path="api-messages" element={<AdminApiMessages />} />
            <Route path="playground" element={<AdminPlaygroundMonitoring />} />
          </Route>
          
          {/* Documentation Routes */}
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/documentation/slack" element={<SlackLayout />} >
          <Route index element={<Navigate to="/documentation/slack/github" replace />} />
            <Route path="github" element={<SlackGithubAgent />} />
            <Route path="project-management" element={<SlackProjectManagementAgent />} />
            <Route path="calendar" element={<SlackCalendarAgent />} />
            <Route path="email" element={<SlackEmailAgent />} />
            </Route>
          <Route path="/documentation/discord" element={<DiscordLayout />}>
            <Route index element={<Navigate to="/documentation/discord/github" replace />} />
            <Route path="github" element={<GitHubAgent />} />
            <Route path="project-management" element={<ProjectManagementAgent />} />
            <Route path="calendar" element={<CalendarAgent />} />
            <Route path="email" element={<EmailAgent />} />
          </Route>
          <Route path="/documentation/openchat" element={<OpenChatDoc />} />
           </Routes>
        <WaitlistModal 
          isOpen={isWaitlistModalOpen}
          onClose={() => setIsWaitlistModalOpen(false)}
          onAuthSuccess={() => setIsUserAuthenticated(true)}
        />
        
        <GetStartedModal 
          isOpen={isGetStartedModalOpen}
          onClose={() => setIsGetStartedModalOpen(false)}
          onTryPlayground={handleTryPlayground}
          onViewDocumentation={handleViewDocumentation}
        />
        
        {/* Playground Chat Components */}
        <PlaygroundChatButton onClick={() => setIsPlaygroundModalOpen(true)} />
        <PlaygroundChatModal 
          isOpen={isPlaygroundModalOpen}
          onClose={() => setIsPlaygroundModalOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
