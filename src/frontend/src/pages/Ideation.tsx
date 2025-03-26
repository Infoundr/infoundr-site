import React from 'react';
import { Bell, Bot, Check, FileText, Video, File } from 'lucide-react';

const Ideation = () => {
  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Navigation Bar */}
      <header className="border-b py-3 sm:py-4 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <nav className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-6 lg:space-x-8">
              <a href="#" className="text-purple-600 font-medium text-sm sm:text-base">Ideation</a>
              <a href="#" className="text-gray-600 text-sm sm:text-base">Research</a>
              <a href="#" className="text-gray-600 text-sm sm:text-base">Validation</a>
              <a href="#" className="text-gray-600 text-sm sm:text-base">Planning</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-purple-200 overflow-hidden">
              <img src="/api/placeholder/32/32" alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      
      <main className="py-4 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Ideation Hub</h1>
          <p className="text-gray-600 font-poppins text-sm">Transform your ideas into viable business opportunities</p>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="lg:col-span-2">
            {/* New Business Idea Section */}
            <div className="mb-6 sm:mb-10">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-0">New Business Idea</h2>
                <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 text-sm">
                  Save Idea
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <input 
                  type="text" 
                  placeholder="Give your idea a title" 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins text-sm"
                />
                <textarea 
                  placeholder="Describe your business idea in detail..." 
                  rows={5}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins text-sm"
                />
              </div>
            </div>

            {/* AI Analysis Section */}
            <div>
              <div className="flex items-center mb-4 sm:mb-6">
                <Bot size={18} className="text-purple-600 mr-2" />
                <h2 className="text-base sm:text-lg font-bold">AI Analysis</h2>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Market Potential */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-md">
                  <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Market Potential</h3>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="text-right text-gray-700 font-poppins text-sm">85%</div>
                </div>

                {/* Innovation Score */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-md">
                  <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Innovation Score</h3>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div className="text-right text-gray-700 font-poppins text-sm">72%</div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div>
                <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">AI Suggestions</h3>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-600 flex items-center justify-center mr-2 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-gray-700 font-poppins text-xs sm:text-sm">Consider targeting young professionals as early adopters</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-600 flex items-center justify-center mr-2 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-gray-700 font-poppins text-xs sm:text-sm">Explore subscription-based revenue model</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-600 flex items-center justify-center mr-2 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-gray-700 font-poppins text-xs sm:text-sm">Focus on mobile-first approach</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

         
          <div>
            {/* Expert Feedback */}
            <div className="mb-6 sm:mb-10">
              <h2 className="text-base sm:text-lg mb-3 sm:mb-4 font-bold">Expert Feedback</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 border border-gray-100 rounded-md shadow-sm">
                  <div className="flex items-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 mr-2 sm:mr-3 flex-shrink-0">
                      <img src="" alt="" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">John Miller</h3>
                      <p className="text-xs sm:text-sm text-gray-700 font-poppins">Consider focusing on specific pain points in the target market.</p>
                      <p className="text-xs text-gray-500 mt-1 font-poppins">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border border-gray-100 rounded-md shadow-sm">
                  <div className="flex items-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 mr-2 sm:mr-3 flex-shrink-0">
                      <img src="" alt="" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Sarah Chen</h3>
                      <p className="text-xs sm:text-sm text-gray-700 font-poppins">The monetization strategy needs more clarity.</p>
                      <p className="text-xs text-gray-500 mt-1 font-poppins">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpful Resources */}
            <div>
              <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Helpful Resources</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <FileText size={18} className="text-gray-700 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Market Research Guide</h3>
                    <p className="text-xs text-gray-500 font-poppins">PDF - 2.3 MB</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <Video size={18} className="text-gray-700 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Idea Validation Workshop</h3>
                    <p className="text-xs text-gray-500 font-poppins">Video - 45 min</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-md">
                  <File size={18} className="text-gray-700 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Business Model Templates</h3>
                    <p className="text-xs text-gray-500 font-poppins">Template Pack</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ideation;