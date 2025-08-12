import React from 'react';
import Button from '../common/Button';

interface PricingProps {
  onGetStartedClick: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onGetStartedClick }) => {
  const plans = [
    {
      name: 'Starter',
      price: '49',
      description: 'For solo founders & idea-stage startups',
      features: [
        'AI Legal Assistant (contract review, compliance)',
        '1 Platform Integration (Slack, Discord, or OpenChat)',
        'Basic Financial Tracking & Reporting',
        'Startup Operations Checklist + Templates',
        'Simple Project Management',
        'Basic Hiring Workflows',
        'Investor Outreach Templates',
        'Access to Legal Document Templates'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'primary' as const,
      buttonClassName: 'bg-gray-900 text-white hover:bg-gray-800'
    },
    {
      name: 'Professional',
      price: '199',
      description: 'For growing startups handling team, traction & fundraising',
      features: [
        'Unlimited AI Co-Founder + Smart Workflows',
        '3 Platform Integrations (Slack, Discord, OpenChat)',
        'Advanced Legal Automation (contracts, IP, compliance)',
        'Comprehensive Financial Management & Reporting',
        'Investor Relations & Deal Room Creation',
        'Advanced Hiring & HR Workflows',
        'Market Research & Strategic Insights',
        'Tax Compliance & Bookkeeping Automation',
        'Business Decision Simulation',
        'Advanced Project Management',
        'Custom Workflow Automation'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'primary' as const,
      featured: true
    },
    {
      name: 'Enterprise',
      price: '899',
      priceLabel: 'from',
      description: 'For accelerators, venture studios, or scaleups needing full-stack automation',
      features: [
        'Everything in Professional, plus:',
        'Enterprise Legal Automation & Compliance',
        'Advanced Financial Operations & Reporting',
        'Custom AI Workflows & Automation',
        'White-labeled Deal Rooms + NDA Automation',
        'Advanced Document Management (SAFE, SAFT, SHA)',
        'Real-time Financial Dashboards & Analytics',
        'Multi-jurisdiction Tax & Compliance',
        'Full HR Automation (sourcing, contracts, onboarding)',
        'Dedicated Legal AI + Compliance Tracking',
        'Dedicated Success Manager + Strategy Reviews'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'primary' as const,
      buttonClassName: 'bg-gray-900 text-white hover:bg-gray-800'
    }
  ];

  const handleButtonClick = (planName: string) => {
    // Open the waitlist modal for all plans
    onGetStartedClick();
  };

  return (
    <section id="pricing" className="py-12 sm:py-16 bg-[#E5E7EB]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          AI Co-Founder Plans
        </h2>
        <p className="text-center text-gray-600 text-base sm:text-lg mb-8 sm:mb-12">
          Choose the level of AI co-founder support that matches your startup stage
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`border rounded-3xl p-6 sm:p-8 bg-white 
                transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg cursor-pointer
                ${plan.featured ? 'border-purple-600 border-2 relative' : ''}`}
            >
              {plan.featured && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <div className="text-2xl sm:text-3xl font-bold mb-6">
                {plan.priceLabel && <span className="text-base font-normal mr-1">{plan.priceLabel}</span>}
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
                onClick={() => handleButtonClick(plan.name)}
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