import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bell, Settings, MoreHorizontal, PlusCircle, MessageSquare, Clock, Mail, Calendar, PieChart, Slack, Mail as MailIcon, Github } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Sample data for the chart
const chartData = [
  { name: 'Jan', value: 40 },
  { name: 'Feb', value: 45 },
  { name: 'Mar', value: 55 },
  { name: 'Apr', value: 60 },
  { name: 'May', value: 65 },
  { name: 'Jun', value: 70 },
  { name: 'Jul', value: 80 },
  { name: 'Aug', value: 85 },
  { name: 'Sep', value: 90 },
];


// Format data for Chart.js with gradient
const chartJsData = {
  labels: chartData.map(item => item.name),
  datasets: [
    {

      label: 'Monthly Performance',
      data: chartData.map(item => item.value),


      backgroundColor: function(context: any) {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        
        if (!chartArea) {
          // This case happens on initial chart load
          return 'rgba(136, 132, 216, 0.8)';
        }
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(136, 132, 216, 0.2)');
        gradient.addColorStop(1, 'rgba(136, 132, 216, 0.8)');
        return gradient;
      },
      borderColor: 'rgba(136, 132, 216, 1)',
      borderWidth: 1,
      borderRadius: 6,
      hoverBackgroundColor: 'rgba(136, 132, 216, 1)',
    },
  ],
};


// Chart.js options with enhanced styling
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#666',
      bodyFont: {
        size: 12,
      },
      titleFont: {
        size: 14,
        weight: 700, // Using numeric weight (700 = bold)
      },
      padding: 12,
      borderColor: 'rgba(136, 132, 216, 0.3)',
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        title: function(tooltipItems: TooltipItem<'bar'>[]) {
          return tooltipItems[0].label;
        },
        label: function(context: TooltipItem<'bar'>) {
          return `Value: ${context.parsed.y}`;
        }
      }
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(243, 244, 246, 1)',
        drawBorder: false,
      },
      border: {
        dash: [5, 5],
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11,
        },
        padding: 10,
        callback: function(value: string | number) {
          return value;
        },
      },
      beginAtZero: true,
    },
  },
  animation: {
    duration: 1500,
  },
  layout: {
    padding: {
      top: 20,
      right: 20,
      bottom: 0,
      left: 0
    }
  },
  barPercentage: 0.7,
  categoryPercentage: 0.7,
};

// Card component
interface CardProps {
  children: React.ReactNode;
  className?: string; 
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

// Assistant card component
interface AssistantCardProps {
  icon: React.ReactNode;
  name: string;
  role: string;
  description: string;
}

const AssistantCard: React.FC<AssistantCardProps> = ({ icon, name, role, description }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4 text-sm">{description}</p>
      <button className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
        Chat Now
      </button>
    </Card>
  );
};

// Insight card component
interface InsightCardProps {
  title: string;
  value: string;
  color: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, value, color }) => {
  return (
    <div className="bg-purple-50 p-4 rounded-lg">
      <h3 className="text-gray-700 text-sm mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
};

// Automated task component
interface AutomatedTaskProps {
  icon: React.ReactNode;
  title: string;
  status: string;
}

const AutomatedTask: React.FC<AutomatedTaskProps> = ({ icon, title, status }) => {
  const statusColor = status === "Active" ? "text-green-500" : "text-gray-500";
  
  return (
    <div className="flex items-center justify-between bg-purple-50 p-4 rounded-lg mb-4">
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3">
          {icon}
        </div>
        <span className="text-gray-800">{title}</span>
      </div>
      <span className={statusColor}>{status}</span>
    </div>
  );
};

// Team member component
interface TeamMemberProps {
  avatar: React.ReactNode;
  name: string;
  role: string;
  status: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ avatar, name, role, status }) => {
  const statusBg = status === "Online" ? "bg-green-500" : "bg-gray-300";
  const statusText = status === "Online" ? "Online" : "Away";
  
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          {avatar}
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`${statusBg} text-white text-xs px-3 py-1 rounded-full mr-2`}>
          {statusText}
        </span>
        <MoreHorizontal size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

// Integration component
interface IntegrationProps {
  icon: React.ReactNode;
  name: string;
  status: string;
}

const Integration: React.FC<IntegrationProps> = ({ icon, name, status }) => {
  const statusColor = status === "Connected" ? "text-green-500" : (status === "Connect" ? "text-purple-600" : "text-gray-500");
  
  return (
    <div className="flex items-center justify-between bg-purple-50 p-4 rounded-lg mb-4">
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3">
          {icon}
        </div>
        <span className="text-gray-800">{name}</span>
      </div>
      <span className={statusColor}>{status}</span>
    </div>
  );
};

const Dashboard = () => {
  const [userName, setUserName] = useState("Alex");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="">Welcome back, {userName}!</h1>
            <p className="text-#4B5563">Here's your AI-powered business command center</p>
          </div>
          <div className="flex items-center">
            <button className="p-2 mr-2">
              <Bell size={20} />
            </button>
            <button className="p-2">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* AI Assistants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AssistantCard
            icon={<MessageSquare size={24} className="text-purple-600" />}
            name="Benny"
            role="Fintech Assistant"
            description="Ready to help with financial analysis and forecasting"
          />
          <AssistantCard
            icon={<Mail size={24} className="text-purple-600" />}
            name="Sheila"
            role="Marketing Expert"
            description="Your marketing strategy and campaign assistant"
          />
          <AssistantCard
            icon={<Clock size={24} className="text-purple-600" />}
            name="Muoka"
            role="Legal Advisor"
            description="Here to assist with legal compliance and contracts"
          />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2">
            {/* Business Insights */}
            <Card className="mb-8">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">Business Insights</h2>
                <button>
                  <MoreHorizontal size={20} className="text-gray-400" />
                </button>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 p-6">
                <InsightCard 
                  title="Revenue Growth" 
                  value="+24%" 
                  color="text-purple-600" 
                />
                <InsightCard 
                  title="Team Productivity" 
                  value="87%" 
                  color="text-blue-500" 
                />
                <InsightCard 
                  title="Tasks Automated" 
                  value="142" 
                  color="text-purple-500" 
                />
              </div>
              

              {/* Chart - Enhanced Chart.js implementation */}
              <div className="p-6 h-64">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-gray-700 font-medium">Monthly Performance</h3>
                  <div className="flex space-x-2">
                    <button className="text-xs px-3 py-1 bg-purple-100 text-purple-600 rounded-full">Monthly</button>
                    <button className="text-xs px-3 py-1 text-gray-500 rounded-full">Quarterly</button>
                  </div>
                </div>
                <Bar data={chartJsData} options={chartOptions} />
              </div>
            </Card>

            {/* Team Members */}
            <Card>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">Team Members</h2>
                <button className="flex items-center text-purple-600 font-medium">
                  <PlusCircle size={16} className="mr-1" />
                  Invite
                </button>
              </div>
              <div className="p-6">
                <TeamMember 
                  avatar={<div className="bg-gray-300 w-full h-full"></div>}
                  name="Sarah Chen"
                  role="Product Manager"
                  status="Online"
                />
                <TeamMember 
                  avatar={<div className="bg-gray-300 w-full h-full"></div>}
                  name="Mike Johnson"
                  role="Developer"
                  status="Away"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div>
            {/* Automated Tasks */}
            <Card className="mb-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Automated Tasks</h2>
              </div>
              <div className="p-6">
                <AutomatedTask 
                  icon={<Mail size={20} className="text-purple-600" />}
                  title="Email Reports"
                  status="Active"
                />
                <AutomatedTask 
                  icon={<Calendar size={20} className="text-purple-600" />}
                  title="Meeting Scheduler"
                  status="Active"
                />
                <AutomatedTask 
                  icon={<PieChart size={20} className="text-purple-600" />}
                  title="Analytics Update"
                  status="Paused"
                />
              </div>
            </Card>

            {/* Integrations */}
            <Card>
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Integrations</h2>
              </div>
              <div className="p-6">
                <Integration 
                  icon={<Slack size={20} className="text-purple-600" />}
                  name="Slack"
                  status="Connected"
                />
                <Integration 
                  icon={<MailIcon size={20} className="text-purple-600" />}
                  name="Discord"
                  status="Connected"
                />
                <Integration 
                  icon={<Github size={20} className="text-purple-600" />}
                  name="GitHub"
                  status="Connect"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
