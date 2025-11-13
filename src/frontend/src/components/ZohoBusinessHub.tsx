import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { SupplierNegotiator } from './SupplierNegotiator';
import { EmailManager } from './EmailManager';
import { zohoService } from '../services/zoho';

interface ZohoBusinessHubProps {
  className?: string;
}

export const ZohoBusinessHub: React.FC<ZohoBusinessHubProps> = ({ className = '' }) => {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'email' | 'suppliers' | 'reports' | 'settings'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // In mock mode, clear any existing tokens and set authenticated state
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      localStorage.removeItem('zoho_access_token');
      localStorage.removeItem('zoho_refresh_token');
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(zohoService.isAuthenticated());
    }
  }, []);

  const modules = [
    {
      key: 'dashboard',
      name: 'Dashboard',
      icon: ChartBarIcon,
      description: 'Overview of business activities and metrics',
    },
    {
      key: 'email',
      name: 'Email Management',
      icon: EnvelopeIcon,
      description: 'Manage supplier communications and detect quotes',
    },
    {
      key: 'suppliers',
      name: 'Supplier Negotiator',
      icon: UserGroupIcon,
      description: 'AI-powered supplier negotiations and quote analysis',
    },
    {
      key: 'reports',
      name: 'Reports',
      icon: DocumentTextIcon,
      description: 'Business intelligence and analytics reports',
    },
    {
      key: 'settings',
      name: 'Settings',
      icon: CogIcon,
      description: 'Configure integrations and preferences',
    },
  ];

  const handleAuthenticate = () => {
    // In mock mode, simulate successful authentication
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      setIsAuthenticated(true);
      return;
    }
    
    const authUrl = zohoService.getAuthUrl();
    window.location.href = authUrl;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome to Zoho Business Hub</h2>
            <p className="mt-2 text-indigo-100">
              Streamline your business operations with AI-powered tools and integrations
            </p>
          </div>
          <BuildingOfficeIcon className="h-16 w-16 text-indigo-200" />
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unread Emails</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Quotes</p>
              <p className="text-2xl font-semibold text-gray-900">5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cost Savings</p>
              <p className="text-2xl font-semibold text-gray-900">$2,450</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.slice(1, 4).map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.key}
                onClick={() => setActiveModule(module.key as any)}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
              >
                <Icon className="h-8 w-8 text-indigo-600 mb-2" />
                <h4 className="font-medium text-gray-900">{module.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{module.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">New quote received from TechCorp Solutions</span>
            <span className="text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Negotiation email sent to Global Supplies Inc</span>
            <span className="text-gray-400">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Quote analysis completed for Office Equipment</span>
            <span className="text-gray-400">1 day ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">New supplier contact added: Innovation Partners</span>
            <span className="text-gray-400">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Business Reports</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Cost Savings Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Q4 2024 Negotiations:</span>
              <span className="font-medium text-green-600">$12,450 saved</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Discount:</span>
              <span className="font-medium">8.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Successful Negotiations:</span>
              <span className="font-medium">73%</span>
            </div>
          </div>
        </div>

        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Supplier Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Top Performer:</span>
              <span className="font-medium">TechCorp Solutions</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Response Time:</span>
              <span className="font-medium">2.3 days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>On-time Delivery:</span>
              <span className="font-medium text-green-600">94%</span>
            </div>
          </div>
        </div>

 
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Email Analytics</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quotes Detected:</span>
              <span className="font-medium">47 this month</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Response Rate:</span>
              <span className="font-medium">89%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Auto-processed:</span>
              <span className="font-medium text-blue-600">62%</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">AI Negotiation Insights</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Best Strategy:</span>
              <span className="font-medium">Collaborative</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Avg. Negotiation Rounds:</span>
              <span className="font-medium">2.1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>AI Confidence Score:</span>
              <span className="font-medium text-green-600">8.2/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Zoho Integration Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Zoho Mail</h4>
              <p className="text-sm text-gray-500">Email management and automation</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-green-600 mr-2">Connected</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Zoho CRM</h4>
              <p className="text-sm text-gray-500">Supplier and contact management</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-green-600 mr-2">Connected</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Negotiation Strategy</label>
            <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>Collaborative (Default)</option>
              <option>Competitive</option>
              <option>Accommodating</option>
              <option>Compromising</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Confidence Threshold</label>
            <input
              type="range"
              min="1"
              max="10"
              defaultValue="7"
              className="mt-1 block w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Conservative (1)</span>
              <span>Aggressive (10)</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Auto-detect quotes in emails
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Send negotiation suggestions
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-8 text-center ${className}`}>
        <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Zoho Business Hub</h2>
        <p className="text-gray-600 mb-6">
          Connect your Zoho account to access powerful business automation tools including:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="border border-gray-200 rounded-lg p-4">
            <EnvelopeIcon className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Email Management</h3>
            <p className="text-sm text-gray-500">Automated quote detection and supplier communication</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <UserGroupIcon className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Supplier Negotiator</h3>
            <p className="text-sm text-gray-500">AI-powered negotiation assistance and quote analysis</p>
          </div>
        </div>
        
        <button
          onClick={handleAuthenticate}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <CogIcon className="h-5 w-5 mr-2" />
          Connect Zoho Account
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
    
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.key}
                  onClick={() => setActiveModule(module.key as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeModule === module.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {module.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

     
      <div>
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'email' && <EmailManager />}
        {activeModule === 'suppliers' && <SupplierNegotiator />}
        {activeModule === 'reports' && renderReports()}
        {activeModule === 'settings' && renderSettings()}
      </div>
    </div>
  );
};
