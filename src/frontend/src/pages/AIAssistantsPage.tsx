import React, { useState } from 'react';
import { 
  Bell, 
  Home, 
  Bot, 
  ClipboardList, 
  Search, 
  Plus, 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  FileText, 
  Star, 
  Menu,
  ChevronRight,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="h-screen bg-purple-900 w-64 fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-blue-300">
          Inf<span className="text-blue-200">oundr</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <ul className="space-y-4">
          <li>
            <a href="#" className="flex items-center px-6 py-3 text-white hover:bg-purple-800">
              <Home className="mr-3" size={20} />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-6 py-3 text-white bg-purple-800">
              <Bot className="mr-3" size={20} />
              <span>AI Assistants</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-6 py-3 text-white hover:bg-purple-800">
              <ClipboardList className="mr-3" size={20} />
              <span>Task Automation</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

interface AssistantCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  usageCount: number;
  rating: number;
}

const AssistantCard: React.FC<AssistantCardProps> = ({ name, description, icon, category, usageCount, rating }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-base sm:text-lg">{name}</h3>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">{category}</span>
        </div>
      </div>
      <p className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm h-12 line-clamp-2">{description}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
          <MessageSquare size={14} className="mr-1" />
          <span>{usageCount} uses</span>
        </div>
        <div className="flex items-center text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < rating ? "currentColor" : "none"} 
              className="mr-0.5"
            />
          ))}
        </div>
      </div>
      <button className="w-full mt-3 sm:mt-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
        Chat Now
      </button>
    </div>
  );
};

const AIAssistantsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Business', 'Marketing', 'Finance', 'Legal', 'Operations', 'Development'];
  
  const assistants = [
    {
      id: 1,
      name: "Strategy Advisor",
      description: "Helps analyze market trends and develop business strategies",
      category: "Business",
      usageCount: 246,
      rating: 4,
      icon: <TrendingUp size={20} className="text-purple-600" />
    },
    {
      id: 2,
      name: "Marketing Planner",
      description: "Creates effective marketing campaigns and content",
      category: "Marketing",
      usageCount: 183,
      rating: 5,
      icon: <MessageSquare size={20} className="text-purple-600" />
    },
    {
      id: 3,
      name: "Financial Analyst",
      description: "Provides financial forecasting and investment analysis",
      category: "Finance",
      usageCount: 127,
      rating: 4,
      icon: <TrendingUp size={20} className="text-purple-600" />
    },
    {
      id: 4,
      name: "Legal Document Assistant",
      description: "Drafts and reviews contracts and legal documents",
      category: "Legal",
      usageCount: 95,
      rating: 4,
      icon: <FileText size={20} className="text-purple-600" />
    },
    {
      id: 5,
      name: "Process Optimizer",
      description: "Identifies inefficiencies and suggests workflows",
      category: "Operations",
      usageCount: 156,
      rating: 3,
      icon: <ClipboardList size={20} className="text-purple-600" />
    },
    {
      id: 6,
      name: "Code Assistant",
      description: "Helps write and debug code across multiple languages",
      category: "Development",
      usageCount: 312,
      rating: 5,
      icon: <Brain size={20} className="text-purple-600" />
    },
    {
      id: 7,
      name: "Customer Insights Analyst",
      description: "Analyzes customer data to identify patterns",
      category: "Business",
      usageCount: 138,
      rating: 4,
      icon: <TrendingUp size={20} className="text-purple-600" />
    },
    {
      id: 8,
      name: "Content Creator",
      description: "Generates engaging content for blogs, social media, and emails",
      category: "Marketing",
      usageCount: 201,
      rating: 4,
      icon: <MessageSquare size={20} className="text-purple-600" />
    }
  ];

  const filteredAssistants = assistants.filter(assistant => {
    const matchesSearch = assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          assistant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || assistant.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold">AI Assistants</h1>
            <p className="text-gray-600 text-sm">Specialized AI helpers for your startup needs</p>
          </div>
          <div className="flex items-center">
            <button className="p-2 mr-2">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-purple-200 overflow-hidden">
              <img src="/api/placeholder/32/32" alt="Profile" />
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-1/3">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search assistants..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map(category => (
              <button 
                key={category}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm ${
                  activeCategory === category 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Assistants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAssistants.map(assistant => (
            <AssistantCard 
              key={assistant.id}
              name={assistant.name}
              description={assistant.description}
              icon={assistant.icon}
              category={assistant.category}
              usageCount={assistant.usageCount}
              rating={assistant.rating}
            />
          ))}
          
          {/* Create Custom Assistant Card */}
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 sm:p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
              <Plus size={20} />
            </div>
            <p className="font-medium text-sm sm:text-base">Create Custom Assistant</p>
            <p className="text-xs sm:text-sm text-center mt-2">Build a specialized AI assistant for your specific needs</p>
          </div>
        </div>
        
        {/* Recently Used Section */}
        <div className="mt-8 sm:mt-12">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">Recently Used</h2>
            <button className="text-purple-600 text-xs sm:text-sm flex items-center">
              View All
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y">
            {assistants.slice(0, 3).map(assistant => (
              <div key={`recent-${assistant.id}`} className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center mr-2 sm:mr-4 flex-shrink-0">
                    {assistant.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">{assistant.name}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">Last used 2 hours ago</p>
                  </div>
                </div>
                <button className="px-3 sm:px-4 py-1 sm:py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-xs sm:text-sm">
                  Resume
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantsPage;