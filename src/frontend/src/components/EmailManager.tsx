import React, { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { zohoService, ZohoEmailMessage, SupplierQuote } from '../services/zoho';

interface EmailManagerProps {
  className?: string;
}

export const EmailManager: React.FC<EmailManagerProps> = ({ className = '' }) => {
  const [emails, setEmails] = useState<ZohoEmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ZohoEmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'suppliers' | 'quotes'>('all');
  const [detectedQuotes, setDetectedQuotes] = useState<SupplierQuote[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [emailDraft, setEmailDraft] = useState({
    to: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    if (zohoService.isAuthenticated()) {
      loadEmails();
    }
  }, []);

  const loadEmails = async () => {
    try {
      setIsLoading(true);
      const emailData = await zohoService.getEmails('INBOX', 100);
      setEmails(emailData);
      
      // Process emails for quotes
      await processEmailsForQuotes(emailData);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processEmailsForQuotes = async (emailList: ZohoEmailMessage[]) => {
    const quotes: SupplierQuote[] = [];
    
    for (const email of emailList) {
      if (isQuoteEmail(email)) {
        try {
          const quoteData = await zohoService.parseEmailForQuote(email.content);
          if (quoteData) {
            const quote: SupplierQuote = {
              ...quoteData,
              id: `Q-${email.id}`,
              supplierId: email.fromAddress,
              supplierName: extractSupplierName(email.fromAddress),
              supplierEmail: email.fromAddress,
              receivedDate: email.receivedTime,
              status: 'pending',
            } as SupplierQuote;
            
            quotes.push(quote);
          }
        } catch (error) {
          console.error('Failed to parse email for quote:', error);
        }
      }
    }
    
    setDetectedQuotes(quotes);
  };

  const isQuoteEmail = (email: ZohoEmailMessage): boolean => {
    const quoteKeywords = ['quote', 'proposal', 'pricing', 'estimate', 'bid', 'offer'];
    const subject = email.subject.toLowerCase();
    const content = email.content.toLowerCase();
    
    return quoteKeywords.some(keyword => 
      subject.includes(keyword) || content.includes(keyword)
    );
  };

  const extractSupplierName = (email: string): string => {
    // Extract supplier name from email address or content
    const domain = email.split('@')[1];
    return domain ? domain.split('.')[0] : email;
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = !searchTerm || 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterStatus) {
        case 'unread':
          return !email.isRead;
        case 'suppliers':
          return isSupplierEmail(email);
        case 'quotes':
          return isQuoteEmail(email);
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const isSupplierEmail = (email: ZohoEmailMessage): boolean => {
    const supplierKeywords = ['supplier', 'vendor', 'procurement', 'purchase', 'order'];
    const content = (email.subject + ' ' + email.content).toLowerCase();
    return supplierKeywords.some(keyword => content.includes(keyword));
  };

  const sendEmail = async () => {
    try {
      setIsLoading(true);
      await zohoService.sendEmail(
        [emailDraft.to],
        emailDraft.subject,
        emailDraft.content
      );
      
      setShowComposer(false);
      setEmailDraft({ to: '', subject: '', content: '' });
      await loadEmails(); // Refresh emails
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailIcon = (email: ZohoEmailMessage) => {
    if (isQuoteEmail(email)) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
    }
    if (isSupplierEmail(email)) {
      return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
    }
    return <EnvelopeIcon className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Email Management</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowComposer(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              Compose
            </button>
            <button
              onClick={loadEmails}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="block text-sm border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Emails</option>
              <option value="unread">Unread</option>
              <option value="suppliers">Suppliers</option>
              <option value="quotes">Quotes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* Email List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                  } ${!email.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {getEmailIcon(email)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${!email.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                          {email.fromAddress}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(email.receivedTime).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`text-sm truncate ${!email.isRead ? 'font-semibold' : ''} text-gray-700`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {email.content.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Content */}
        <div className="flex-1 p-6">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{selectedEmail.subject}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      isQuoteEmail(selectedEmail) ? 'bg-orange-100 text-orange-800' :
                      isSupplierEmail(selectedEmail) ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {isQuoteEmail(selectedEmail) ? 'Quote' :
                       isSupplierEmail(selectedEmail) ? 'Supplier' : 'General'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>From:</strong> {selectedEmail.fromAddress}</p>
                  <p><strong>Date:</strong> {new Date(selectedEmail.receivedTime).toLocaleString()}</p>
                  {selectedEmail.toAddress.length > 0 && (
                    <p><strong>To:</strong> {selectedEmail.toAddress.join(', ')}</p>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                />
              </div>
              
              {isQuoteEmail(selectedEmail) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">
                      Quote Detected
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-yellow-700">
                    This email appears to contain a quote. Consider analyzing it in the Supplier Negotiator.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <InboxIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm">Select an email to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Summary */}
      {detectedQuotes.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Detected Quotes ({detectedQuotes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {detectedQuotes.slice(0, 3).map((quote) => (
              <div key={quote.id} className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                <p className="font-medium text-orange-900">{quote.subject}</p>
                <p className="text-orange-700">{quote.supplierName}</p>
                <p className="text-orange-600">{quote.total} {quote.currency}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compose Email</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">To</label>
                  <input
                    type="email"
                    value={emailDraft.to}
                    onChange={(e) => setEmailDraft({ ...emailDraft, to: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="recipient@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={emailDraft.subject}
                    onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={emailDraft.content}
                    onChange={(e) => setEmailDraft({ ...emailDraft, content: e.target.value })}
                    rows={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowComposer(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={isLoading || !emailDraft.to || !emailDraft.subject}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
