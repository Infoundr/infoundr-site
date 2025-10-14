import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import InFoundrNotification from '../common/InFoundrNotification';
import { useInFoundrNotification } from '../../hooks/useInFoundrNotification';
import { checkIsAuthenticated, hasActiveProSubscription } from '../../services/auth';

interface PricingProps {
  onGetStartedClick: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onGetStartedClick }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const { notification, showSuccess, hideNotification } = useInFoundrNotification();
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Try our working AI agents today',
      features: [
        '50 AI agent requests per day',
        'GitHub Automation (repositories, issues, pull requests)',
        'Project Management (tasks, workflows, progress tracking)',
        'Calendar Management (meetings, reminders, scheduling)',
        'Email Automation (drafts, templates, outreach)',
        '1 Platform Integration (Slack, Discord, or OpenChat)',
        'Community support'
      ],
      buttonText: 'Start Free',
      buttonVariant: 'primary' as const,
      buttonClassName: 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transition-all duration-200',
      featured: true
    },
    {
      name: 'Pro',
      price: '20',
      description: 'Unlimited access to all AI agents',
      features: [
        'Unlimited AI agent requests',
        'All current agents (GitHub, Project Management, Calendar, Email)',
        'Contract Review & Legal (Coming Soon)',
        'Financial Reporting & Bookkeeping (Coming Soon)',
        'Investor Relations & Deal Rooms (Coming Soon)',
        'Hiring & HR Workflows (Coming Soon)',
        'All platform integrations (Slack, Discord, OpenChat)',
        'Priority support & faster response times',
        'Advanced analytics & insights dashboard'
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary' as const,
      buttonClassName: 'bg-gray-900 text-white hover:bg-gray-800',
      featured: false
    }
  ];

  const handleProUpgradeClick = async () => {
    setIsCheckingAuth(true);
    
    try {
      // Check if user is authenticated
      const isAuth = await checkIsAuthenticated();
      
      if (!isAuth) {
        // User is not authenticated, set payment intent and redirect to auth
        console.log('🔒 User not authenticated, setting payment intent...');
        
        // Store payment intent in sessionStorage to persist across page navigation
        sessionStorage.setItem('payment_intent', 'pro_upgrade');
        sessionStorage.setItem('payment_intent_timestamp', Date.now().toString());
        
        console.log('✅ Payment intent set:', {
          intent: sessionStorage.getItem('payment_intent'),
          timestamp: sessionStorage.getItem('payment_intent_timestamp')
        });
        
        // Redirect to auth page with payment context in URL
        console.log('🔀 Redirecting to /dashboard?intent=payment');
        navigate('/dashboard?intent=payment');
      } else {
        // User is authenticated, check if they already have Pro subscription
        console.log('🔍 User authenticated, checking subscription status...');
        
        const hasPro = await hasActiveProSubscription();
        
        if (hasPro) {
          console.log('✅ User already has Pro subscription, redirecting to dashboard');
          
          // Show personalized InFoundr notification
          showSuccess(
            'Welcome back, Pro member! 🎉',
            'You already have an active Pro subscription with unlimited access to all AI agents and premium features. Redirecting you to your dashboard...',
            { duration: 3000 }
          );
          
          // Small delay to let user see the notification before redirecting
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // User doesn't have Pro, proceed to payment checkout
          console.log('💰 User needs to upgrade to Pro, redirecting to payment checkout...');
          navigate('/payment/checkout');
        }
      }
    } catch (error) {
      console.error('Error during upgrade process:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleButtonClick = (planName: string, buttonText: string) => {
    // Redirect to documentation for Start Free button
    if (buttonText === 'Start Free') {
      window.location.href = '/documentation';
    }
    
    // Handle Pro upgrade
    if (planName === 'Pro') {
      handleProUpgradeClick();
    }
  };

  return (
    <section id="pricing" className="py-12 sm:py-16 bg-[#E5E7EB]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 text-base sm:text-lg mb-8 sm:mb-12">
          Start free with our working AI agents, Pro tier coming soon with unlimited access
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`flex flex-col justify-between h-full border rounded-3xl p-6 sm:p-8 bg-white
                transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg cursor-pointer
                ${plan.featured ? 'border-purple-600 border-2 relative' : ''} ${plan.name === 'Pro' ? 'relative' : ''}`}
            >
              {plan.featured && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              )}
              <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <div className="text-2xl sm:text-3xl font-bold mb-6">
                ${plan.price}<span className="text-base font-normal">/mo</span>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className={`mt-1 ${plan.featured ? 'text-purple-600' : 'text-green-500'}`}>✓</span> 
                    <span className="text-gray-600">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              </div>
              <Button 
                variant={plan.buttonVariant}
                className={`w-full mt-auto ${
                  plan.featured 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : (plan.buttonClassName || 'bg-gray-900 text-white hover:bg-gray-800')
                }`}
                onClick={() => handleButtonClick(plan.name, plan.buttonText)}
                disabled={plan.name === 'Pro' && isCheckingAuth}
              >
                {plan.name === 'Pro' && isCheckingAuth ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* InFoundr Notification */}
      <InFoundrNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        duration={notification.duration}
      />
    </section>
  );
};

export default Pricing; 