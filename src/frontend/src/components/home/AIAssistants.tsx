import { Assistant } from '../../types';
import Card from '../common/Card';

const AIAssistants: React.FC = () => {
  const assistants: Assistant[] = [
    {
      name: 'Benny',
      description: 'Your strategic thinking partner for business planning and decision making',
      icon: '🧠'
    },
    {
      name: 'Uncle Startups',
      description: 'Expert guidance on startup growth and market analysis',
      icon: '📈'
    },
    {
      name: 'Dean',
      description: 'Creative problem solving and innovation strategy specialist',
      icon: '💡'
    }
  ];

  return (
    <section className="ai-assistants py-16">
      <h2 className="text-center text-3xl font-bold mb-4">Meet Our AI Assistants</h2>
      <p className="text-center mb-8">
        Specialized bots designed to support every aspect of your business
      </p>
      <div className="grid grid-cols-3 gap-8 px-8">
        {assistants.map((assistant) => (
          <Card key={assistant.name}>
            <div className="text-4xl mb-4">{assistant.icon}</div>
            <h3 className="text-xl font-bold mb-2">{assistant.name}</h3>
            <p>{assistant.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AIAssistants; 