import Header from './components/layout/Header';
import Hero from './components/home/Hero';
import AIAssistants from './components/home/AIAssistants';
import Features from './components/home/Features';
import Pricing from './components/home/Pricing';
import Footer from './components/layout/Footer';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <AIAssistants />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default App; 