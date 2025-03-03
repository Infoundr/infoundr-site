import Button from '../common/Button';

function Hero() {
  return (
    <section className="hero flex items-center justify-between px-8 py-16">
      <div className="hero-content">
        <h1 className="text-5xl font-bold mb-4">
          Your Personal Board of AI Advisors
        </h1>
        <p className="text-lg mb-8">
          Meet Infoundr - a suite of AI-powered bots modeled after successful entrepreneurs. 
          Get personalized guidance on critical thinking, innovation, and business strategy 
          from AI assistants that understand your unique challenges.
        </p>
        <div className="flex gap-4">
          <Button variant="primary">Get Started Free</Button>
          <Button variant="secondary">Watch Demo</Button>
        </div>
      </div>
      <div className="hero-image">
        <img src="/hero-image.svg" alt="AI Assistant" />
      </div>
    </section>
  );
}

export default Hero; 