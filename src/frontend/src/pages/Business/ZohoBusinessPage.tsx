import React, { useEffect } from 'react';
import { ZohoBusinessHub } from '../../components/ZohoBusinessHub';

const ZohoBusinessPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Zoho Business Hub - InFoundr';
  }, []);

  return (
    <>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Zoho Business Hub</h1>
            <p className="mt-2 text-lg text-gray-600">
              Streamline your supplier negotiations and business communications with AI-powered automation
            </p>
          </div>
          
          <ZohoBusinessHub />
        </div>
      </div>
    </>
  );
};

export default ZohoBusinessPage;
