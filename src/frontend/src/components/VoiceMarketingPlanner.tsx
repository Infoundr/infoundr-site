import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Download, 
  Loader2, 
  Volume2,
  Calendar,
  MessageSquare,
  Video,
  Headphones,
  Globe,
  Sparkles,
  RefreshCw,
  Settings
} from 'lucide-react';
import ElevenLabsService, { CampaignGoal, CampaignPlan, ContentIdea } from '../services/elevenlabs';
// import ElevenLabsSetupGuide from './setup/ElevenLabsSetupGuide';
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types/speech.d';

interface VoiceMarketingPlannerProps {
  className?: string;
}

const VoiceMarketingPlanner: React.FC<VoiceMarketingPlannerProps> = ({ className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [voiceSnippets, setVoiceSnippets] = useState<{ [key: string]: Blob }>({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [transcript, setTranscript] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elevenLabsService = useRef(new ElevenLabsService());

 
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
            setCampaignGoal(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Update speech recognition language when selection changes
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT'
    };
    if (recognitionRef.current) {
      recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const generateCampaignPlan = async () => {
    if (!campaignGoal.trim()) {
      alert('Please enter or speak a campaign goal');
      return;
    }

    setIsGenerating(true);
    try {
      const goal: CampaignGoal = {
        goal: campaignGoal,
        duration: 'week',
        tone: 'professional'
      };

      const plan = await elevenLabsService.current.generateCampaignPlan(goal);
      setCampaignPlan(plan);
      
      // Only generate voice snippet if API is configured
      if (elevenLabsService.current.isConfigured()) {
        await generateVoiceSnippetForContent(plan.contentCalendar[0], 0);
      }
      
    } catch (error) {
      console.error('Error generating campaign plan:', error);
      alert('Failed to generate campaign plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVoiceSnippetForContent = async (content: ContentIdea, index: number) => {
    if (!elevenLabsService.current.isConfigured()) {
      // Show demo notification
      alert('ElevenLabs API key required for voice generation. See setup instructions above.');
      return;
    }

    try {
      const key = `content_${index}`;
      const audioBlob = await elevenLabsService.current.generateVoiceSnippet(content, undefined, selectedLanguage);
      setVoiceSnippets(prev => ({ ...prev, [key]: audioBlob }));
    } catch (error) {
      console.error('Error generating voice snippet:', error);
      alert('Failed to generate voice snippet');
    }
  };

  const playAudio = async (key: string) => {
    const audioBlob = voiceSnippets[key];
    if (!audioBlob) return;

    if (isPlayingAudio === key) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingAudio(null);
      return;
    }

    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlayingAudio(key);
        
        audioRef.current.onended = () => {
          setIsPlayingAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const downloadAudio = (key: string, filename: string) => {
    const audioBlob = voiceSnippets[key];
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare size={16} />;
      case 'caption': return <MessageSquare size={16} />;
      case 'video_script': return <Video size={16} />;
      case 'voice_snippet': return <Headphones size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const isApiConfigured = elevenLabsService.current.isConfigured();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>
      <audio ref={audioRef} style={{ display: 'none' }} />
      
    
      {!isApiConfigured && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <Sparkles className="text-yellow-600" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900">Demo Mode - ElevenLabs API Required for Voice Features</h4>
                <p className="text-sm text-yellow-700">
                  You can explore the campaign planning interface, but voice generation requires an ElevenLabs API key.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSetupGuide(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <Settings size={16} />
              <span>Quick Setup</span>
            </button>
          </div>
        </div>
      )}
      
      
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="text-purple-600 mr-2" />
              Voice Marketing Planner
              {!isApiConfigured && (
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">DEMO MODE</span>
              )}
            </h2>
            <p className="text-gray-600 mt-1">
              {isApiConfigured 
                ? "Create voice-powered marketing campaigns with AI" 
                : "Explore campaign planning features (voice generation requires API setup)"
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
              disabled={!isApiConfigured}
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="it">🇮🇹 Italian</option>
            </select>
            <Globe size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

    
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">What's your campaign goal?</h3>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <textarea
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              placeholder="e.g., 'Promote my new coffee brand this week' or click the mic to speak..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={toggleListening}
            className={`p-3 rounded-lg transition-all duration-200 ${
              isListening 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>

        {transcript && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Transcript:</strong> {transcript}
            </p>
          </div>
        )}

        <button
          onClick={generateCampaignPlan}
          disabled={isGenerating || !campaignGoal.trim()}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Generating Campaign...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate Voice Campaign</span>
            </>
          )}
        </button>

        
        {!campaignGoal.trim() && (
          <button
            onClick={() => {
              setCampaignGoal("Promote my new sustainable coffee brand to eco-conscious millennials this week");
              setTimeout(() => generateCampaignPlan(), 100);
            }}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <span>✨</span>
            <span>Try Sample Campaign: "Promote my sustainable coffee brand"</span>
          </button>
        )}
      </div>

      
      {campaignPlan && (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{campaignPlan.title}</h3>
            <p className="text-gray-600">{campaignPlan.description}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <Calendar className="mr-2 text-purple-600" />
              Content Calendar
            </h4>
            
            {campaignPlan.contentCalendar.map((content, index) => {
              const contentKey = `content_${index}`;
              const hasAudio = voiceSnippets[contentKey];
              const isPlaying = isPlayingAudio === contentKey;
              
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getContentTypeIcon(content.type)}
                      <span className="font-medium capitalize text-gray-900">
                        {content.type.replace('_', ' ')}
                      </span>
                      {content.platform && (
                        <span className="text-sm text-gray-500">• {content.platform}</span>
                      )}
                      {content.day && (
                        <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {content.day}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 italic">"{content.content}"</p>
                  
                  {content.voiceNotes && (
                    <p className="text-sm text-gray-500 mb-3">
                      <strong>Voice notes:</strong> {content.voiceNotes}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {hasAudio ? (
                      <>
                        <button
                          onClick={() => playAudio(contentKey)}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                          <span>{isPlaying ? 'Pause' : 'Play'}</span>
                        </button>
                        <button
                          onClick={() => downloadAudio(contentKey, `voice_snippet_${index + 1}`)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generateVoiceSnippetForContent(content, index)}
                        disabled={!isApiConfigured}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                          isApiConfigured 
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={!isApiConfigured ? 'ElevenLabs API key required for voice generation' : 'Generate voice snippet'}
                      >
                        <Volume2 size={16} />
                        <span>Generate Voice</span>
                        {!isApiConfigured && <span className="text-xs">(API Required)</span>}
                      </button>
                    )}
                    
                    <button
                      onClick={() => generateVoiceSnippetForContent(content, index)}
                      disabled={!isApiConfigured}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                        isApiConfigured 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={!isApiConfigured ? 'ElevenLabs API key required for voice regeneration' : 'Regenerate with different voice'}
                    >
                      <RefreshCw size={16} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    
      {!isApiConfigured && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="text-purple-600 mr-2" />
              Enable Voice Generation - Quick Setup
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🚀 How to set up ElevenLabs:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Visit <a href="https://elevenlabs.io/app/speech-synthesis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ElevenLabs Speech Synthesis</a></li>
                  <li>Sign up for a free account (10,000 characters/month)</li>
                  <li>Go to your profile → API Keys</li>
                  <li>Copy your API key</li>
                  <li>Add <code className="bg-gray-100 px-1 rounded text-xs">VITE_ELEVENLABS_API_KEY=your_key</code> to <code className="bg-gray-100 px-1 rounded text-xs">.env</code></li>
                  <li>Restart the dev server</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">✨ What you'll unlock:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Generate realistic voice snippets from text</li>
                  <li>Multiple AI voice personalities (Adam, Bella, Arnold, etc.)</li>
                  <li>Multilingual support (English, Spanish, French, German, Italian)</li>
                  <li>Download MP3 files for social media posts</li>
                  <li>Voice-optimized content for different platforms</li>
                  <li>Real-time audio generation and playback</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro tip:</strong> The free ElevenLabs plan includes 10,000 characters per month, 
                which is enough to generate dozens of voice snippets for your marketing campaigns!
              </p>
            </div>
          </div>
        </div>
      )}

      
     
    </div>
  );
};

export default VoiceMarketingPlanner;
