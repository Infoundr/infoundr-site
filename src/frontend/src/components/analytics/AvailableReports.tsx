import React from 'react';

const AvailableReports: React.FC = () => {
  const reports = [
    {
      name: 'Q1 2025 Performance Report',
      format: 'PDF',
      size: '2.5 MB',
      icon: '📄'
    },
    {
      name: 'Monthly Analytics Data',
      format: 'XLSX',
      size: '1.8 MB',
      icon: '📊'
    },
    {
      name: 'Raw Data Export',
      format: 'CSV',
      size: '956 KB',
      icon: '📑'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Available Reports</h2>
        <button className="text-[#7C3AED] text-sm font-medium hover:underline">
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, index) => (
          <div key={index} className="bg-[#F9F5FF] p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{report.icon}</span>
              <div>
                <h3 className="font-medium mb-1">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.format} - {report.size}</p>
              </div>
            </div>
            <button className="text-[#7C3AED] hover:bg-[#7C3AED]/10 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableReports; 