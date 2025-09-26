import React from 'react';
import Button from '../common/Button';

interface PricingProps {
  onGetStartedClick: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onGetStartedClick }) => {
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
      buttonText: 'Get Started',
      buttonVariant: 'primary' as const,
      buttonClassName: 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transition-all duration-200',
      featured: false
    }
  ];

  const handleButtonClick = (planName: string, buttonText: string) => {
    // Redirect to documentation for Start Free button
    if (buttonText === 'Start Free') {
      window.location.href = '/documentation';
    }
    // Pro button can also redirect or call your onGetStartedClick
    if (buttonText === 'Get Started') {
      onGetStartedClick();
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
              className={`border rounded-3xl p-6 sm:p-8 bg-white 
                transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg cursor-pointer
                ${plan.featured ? 'border-purple-600 border-2 relative' : ''} ${plan.name === 'Pro' ? 'relative' : ''}`}
            >
              {plan.featured && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              )}
              
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
              <Button 
                variant={plan.buttonVariant}
                className={`w-full ${
                  plan.featured 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : (plan.buttonClassName || 'bg-gray-900 text-white hover:bg-gray-800')
                }`}
                onClick={() => handleButtonClick(plan.name, plan.buttonText)}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing; 