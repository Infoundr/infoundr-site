import Button from '../common/Button';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-8 py-4">
      <div className="logo">
        <img src="/logo.svg" alt="Infoundr" />
      </div>
      <nav className="flex gap-6">
        <a href="#home">Home</a>
        <a href="#bots">Bots</a>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#contact">Contact</a>
      </nav>
      <Button variant="primary">Get Started</Button>
    </header>
  );
};

export default Header; 