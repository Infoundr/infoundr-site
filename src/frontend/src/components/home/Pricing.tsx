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
      buttonVariant: 'secondary' as const
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
      buttonVariant: 'primary' as const
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
      buttonVariant: 'secondary' as const
    }
  ];

  return (
    <section className="py-16">
      <h2 className="text-center text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
      <p className="text-center mb-12">Choose the plan that works best for your business</p>
      <div className="grid grid-cols-3 gap-8 px-8">
        {plans.map((plan) => (
          <div key={plan.name} className="border rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
            <div className="text-3xl font-bold mb-6">
              ${plan.price}<span className="text-base font-normal">/mo</span>
            </div>
            <ul className="mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="mb-2 flex items-center gap-2">
                  <span className="text-green-500">✓</span> {feature}
                </li>
              ))}
            </ul>
            <Button variant={plan.buttonVariant}>{plan.buttonText}</Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing; 