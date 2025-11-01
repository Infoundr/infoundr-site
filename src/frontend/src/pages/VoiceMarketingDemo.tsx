import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import VoiceMarketingPlanner from '../components/VoiceMarketingPlanner';

const VoiceMarketingDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
     
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
             
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                
                Voice Marketing Planner 
              </h1>
            </div>
            <div className="flex items-center space-x-2">
             
            </div>
          </div>
        </div>
      </div>

      
      <div className="container mx-auto px-4 py-8">
       
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the Future of Marketing Content Creation
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Create voice-powered marketing campaigns in minutes. Simply speak your campaign goal, 
              and our AI will generate a complete content calendar with personalized voice snippets 
              for your brand.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-purple-50 p-6 rounded-lg">
                
                <h3 className="font-semibold text-gray-900 mb-2">Voice Input</h3>
                <p className="text-sm text-gray-600">
                  Speak your campaign goals naturally - no need to type
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
               
                <h3 className="font-semibold text-gray-900 mb-2">AI Planning</h3>
                <p className="text-sm text-gray-600">
                  Get intelligent content calendars with platform-specific ideas
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                
                <h3 className="font-semibold text-gray-900 mb-2">Voice Snippets</h3>
                <p className="text-sm text-gray-600">
                  Generate realistic voice content for social media and ads
                </p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          
            How to Use This Demo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-800 mb-1">1. Set Your Goal</p>
              <p className="text-gray-600">Click the microphone and say something like: "Promote my new coffee brand this week"</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-1">2. Generate Campaign</p>
              <p className="text-gray-600">Click "Generate Voice Campaign" to create your content calendar</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-1">3. Create Voice Content</p>
              <p className="text-gray-600">Click "Generate Voice" on any content piece to hear it spoken</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-1">4. Download & Use</p>
              <p className="text-gray-600">Download voice snippets for your social media posts and ads</p>
            </div>
          </div>
        </div>
        
        <VoiceMarketingPlanner className="shadow-lg" />
 
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Demo Features & Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Multilingual</h4>
              <p className="text-sm text-gray-600">Generate voice content in multiple languages</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Voice Personalities</h4>
              <p className="text-sm text-gray-600">Different AI voices for different content types</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Platform Optimized</h4>
              <p className="text-sm text-gray-600">Content tailored for Instagram, TikTok, YouTube</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time</h4>
              <p className="text-sm text-gray-600">Instant voice generation and playback</p>
            </div>
          </div>
        </div>

       
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Voice-First Interface</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">AI Content Generation</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Multilingual Support</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Real-time Synthesis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceMarketingDemo;
