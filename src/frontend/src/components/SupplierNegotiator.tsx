import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { 
  zohoService, 
  SupplierContact, 
  SupplierQuote, 
  QuoteAnalysis, 
  NegotiationPoint 
} from '../services/zoho';

interface SupplierNegotiatorProps {
  className?: string;
}

export const SupplierNegotiator: React.FC<SupplierNegotiatorProps> = ({ className = '' }) => {
  const [suppliers, setSuppliers] = useState<SupplierContact[]>([]);
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [analysis, setAnalysis] = useState<QuoteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'quotes' | 'negotiations'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(zohoService.isAuthenticated());
    if (zohoService.isAuthenticated()) {
      loadSuppliers();
      loadQuotes();
    }
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const supplierData = await zohoService.getSuppliers();
      setSuppliers(supplierData);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuotes = async () => {
    try {
      // Use mock data for demonstration
      const { default: MockZohoData } = await import('../mocks/zohoMockData');
      const mockQuotes = MockZohoData.getQuotes();
      setQuotes(mockQuotes);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    }
  };

  const analyzeQuote = async (quote: SupplierQuote) => {
    try {
      setIsLoading(true);
      setSelectedQuote(quote);
      const quoteAnalysis = await zohoService.analyzeQuote(quote);
      setAnalysis(quoteAnalysis);
    } catch (error) {
      console.error('Failed to analyze quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNegotiationEmail = async (negotiationPoints: NegotiationPoint[]) => {
    if (!selectedQuote) return;

    try {
      const emailContent = await zohoService.generateNegotiationEmail(
        selectedQuote,
        negotiationPoints,
        'collaborative'
      );
      
      // Open email composer or copy to clipboard
      navigator.clipboard.writeText(emailContent);
      alert('Negotiation email copied to clipboard!');
    } catch (error) {
      console.error('Failed to generate negotiation email:', error);
    }
  };

  const handleAuthenticate = () => {
    const authUrl = zohoService.getAuthUrl();
    window.location.href = authUrl;
  };

  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Connect to Zoho</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your Zoho account to manage suppliers and automate negotiations
          </p>
          <div className="mt-6">
            <button
              onClick={handleAuthenticate}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect Zoho Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summary Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{suppliers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Quotes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quotes.filter(q => q.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Negotiation</p>
              <p className="text-2xl font-semibold text-gray-900">
                {quotes.filter(q => q.status === 'negotiating').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Potential Savings</p>
              <p className="text-2xl font-semibold text-gray-900">$2,450</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Quotes</h3>
        <div className="space-y-4">
          {quotes.slice(0, 5).map((quote) => (
            <div key={quote.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{quote.subject}</h4>
                <p className="text-sm text-gray-500">{quote.supplierName}</p>
                <p className="text-sm text-gray-500">{new Date(quote.receivedDate).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{quote.total} {quote.currency}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  quote.status === 'negotiating' ? 'bg-blue-100 text-blue-800' :
                  quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quote.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Cost Optimization</p>
              <p className="text-sm text-gray-500">
                3 suppliers offer better terms for similar products
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Payment Terms</p>
              <p className="text-sm text-gray-500">
                Consider negotiating extended payment terms
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Response Time</p>
              <p className="text-sm text-gray-500">
                Average supplier response: 2.5 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuotes = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quote Management</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quote.subject}</div>
                        <div className="text-sm text-gray-500">ID: {quote.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.supplierName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.total} {quote.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        quote.status === 'negotiating' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => analyzeQuote(quote)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quote Analysis Panel */}
      {selectedQuote && analysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            AI Analysis: {selectedQuote.subject}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Competitive Score:</span>
                  <span className="text-sm font-medium">{analysis.competitiveScore}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Price Comparison:</span>
                  <span className="text-sm font-medium capitalize">
                    {analysis.priceComparison.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Negotiation Points</h4>
              <div className="space-y-3">
                {analysis.negotiationPoints.map((point, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">
                        {point.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        Confidence: {point.confidence}/10
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{point.justification}</p>
                    <div className="text-xs">
                      <span className="text-red-600">Current: {point.currentValue}</span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600">Proposed: {point.suggestedValue}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => generateNegotiationEmail(analysis.negotiationPoints)}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate Negotiation Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${className}`}>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { key: 'suppliers', label: 'Suppliers', icon: UserGroupIcon },
            { key: 'quotes', label: 'Quotes', icon: EnvelopeIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'quotes' && renderQuotes()}
          {activeTab === 'suppliers' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Directory</h3>
              <p className="text-gray-500">Supplier management functionality will be implemented here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
