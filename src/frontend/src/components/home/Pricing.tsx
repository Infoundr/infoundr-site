import React from 'react';
import Button from '../common/Button';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '49',
      features: [
        '3 AI Assistants',
        'Basic Analytics',
        '5 Team Members'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'dark' as const,
      buttonClassName: 'bg-[#111827] text-white'
    },
    {
      name: 'Professional',
      price: '99',
      features: [
        'All AI Assistants',
        'Advanced Analytics',
        'Unlimited Team Members'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'secondary' as const,
      featured: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Custom AI Solutions',
        'Dedicated Support',
        'Custom Integration'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'dark' as const,
      buttonClassName: 'bg-[#111827] text-white'
    }
  ];

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
                ${plan.featured ? 'bg-[#4C1D95] text-white' : ''}`}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="text-2xl sm:text-3xl font-bold mb-6">
                ${plan.price}<span className="text-base font-normal">/mo</span>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 
                    <span className={plan.featured ? 'text-white' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.buttonVariant} 
                className={`w-full ${plan.buttonClassName || ''}`}
                onClick={() => console.log(`${plan.buttonText} button clicked`)}
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