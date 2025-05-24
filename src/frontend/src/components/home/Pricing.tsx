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
        'AI Founder Assistant (10 prompts/day)',
        '1 Environment Integration (Slack, Discord, or OpenChat)',
        'Company formation checklist + legal templates',
        'Simple project tracking (Trello/Asana-lite)',
        'Basic hiring assistant (role templates, onboarding)',
        'Email templates for investor outreach',
        'Access to pre-filled SAFE + template doc walkthroughs'
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
        'Unlimited Founder Assistant + smart workflows',
        '3 Environment Integrations (Slack, Discord, OpenChat)',
        'Project Management: Trello, Asana',
        'Accounting: QuickBooks, Xero integration',
        'Legal & Compliance: Contract walkthroughs, IP tracking',
        'Automated investor emails & follow-ups',
        'Financial insights: burn rate, runway, P&L',
        'Basic tax prep automation + filing reminders',
        'Hiring support: JD creation, interview guides',
        'Deal Room creation with investor link',
        'Fundraising support (track rounds, auto-update decks)'
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
        'Unlimited integrations + custom API access',
        'Custom AI workflows & automation',
        'White-labeled deal rooms + NDA automation',
        'Document walkthroughs (SAFE, SAFT, SHA)',
        'Real-time accounting dashboards',
        'Advanced tax workflows (multiple jurisdictions)',
        'Full HR automation (sourcing, contracts)',
        'Dedicated legal bot + compliance tracking',
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
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 text-base sm:text-lg mb-8 sm:mb-12">
          Choose the plan that works best for your business
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