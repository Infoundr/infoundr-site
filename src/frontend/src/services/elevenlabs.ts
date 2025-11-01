import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

interface VoiceConfig {
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface CampaignGoal {
  goal: string;
  duration: string;
  targetAudience?: string;
  tone?: string;
}

interface ContentIdea {
  type: 'post' | 'caption' | 'video_script' | 'voice_snippet';
  content: string;
  platform?: string;
  day?: string;
  voiceNotes?: string;
}

interface CampaignPlan {
  title: string;
  description: string;
  contentCalendar: ContentIdea[];
  voiceSnippets?: string[];
}

class ElevenLabsService {
  private client: ElevenLabsClient;
  private apiKey: string;

  constructor() {
   
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.client = new ElevenLabsClient({
      apiKey: this.apiKey,
    });
  }

  
  async generateSpeech(
    text: string, 
    voiceConfig: VoiceConfig = {
      voice_id: 'pNInz6obpgDQGcFmaJgB', 
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      }
    }
  ): Promise<Blob> {
    try {
      const audio = await this.client.textToSpeech.convert(voiceConfig.voice_id, {
        text,
        modelId: voiceConfig.model_id,
        voiceSettings: voiceConfig.voice_settings,
      });

      
      const chunks: Uint8Array[] = [];
      const reader = audio.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const audioBlob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
      return audioBlob;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  
  async getAvailableVoices() {
    try {
      const voices = await this.client.voices.getAll();
      return voices.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  
  async generateCampaignPlan(goal: CampaignGoal): Promise<CampaignPlan> {
    
    const mockPlan: CampaignPlan = {
      title: `${goal.goal} - ${goal.duration} Campaign`,
      description: `A comprehensive marketing campaign designed to ${goal.goal.toLowerCase()} over ${goal.duration.toLowerCase()}.`,
      contentCalendar: [
        {
          type: 'post',
          content: `🚀 Exciting news! We're launching something amazing this ${goal.duration.toLowerCase()}. Stay tuned for updates!`,
          platform: 'Instagram',
          day: 'Monday',
          voiceNotes: 'Use enthusiastic, energetic tone'
        },
        {
          type: 'caption',
          content: `Behind the scenes of our ${goal.goal.toLowerCase()} journey. Here's what we're building...`,
          platform: 'TikTok',
          day: 'Wednesday',
          voiceNotes: 'Casual, authentic voice'
        },
        {
          type: 'video_script',
          content: `"Hey everyone! I'm so excited to share what we've been working on. This ${goal.duration.toLowerCase()}, we're focusing on ${goal.goal.toLowerCase()}, and I can't wait to show you the results!"`,
          platform: 'YouTube',
          day: 'Friday',
          voiceNotes: 'Personal, conversational tone'
        },
        {
          type: 'voice_snippet',
          content: `Welcome to our ${goal.goal.toLowerCase()} campaign! We're here to help you discover amazing new possibilities.`,
          platform: 'Podcast Intro',
          day: 'Daily',
          voiceNotes: 'Professional, warm tone'
        }
      ]
    };

    return mockPlan;
  }

  
  async generateVoiceSnippet(
    content: ContentIdea,
    voiceId?: string,
    language: string = 'en'
  ): Promise<Blob> {
    const selectedVoice = voiceId || this.getVoiceForContent(content);
    const voiceSettings = this.getVoiceSettingsForTone(content.voiceNotes || '');

    return await this.generateSpeech(content.content, {
      voice_id: selectedVoice,
      model_id: language === 'en' ? 'eleven_turbo_v2' : 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    });
  }

  async generateMultilingualSnippet(
    text: string,
    language: string = 'en',
    voiceId?: string
  ): Promise<Blob> {
    const selectedVoice = voiceId || 'pNInz6obpgDQGcFmaJgB'; 

    return await this.generateSpeech(text, {
      voice_id: selectedVoice,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      }
    });
  }

 
  private getVoiceForContent(content: ContentIdea): string {
    const voiceMap = {
      'post': 'pNInz6obpgDQGcFmaJgB', 
      'caption': 'EXAVITQu4vr4xnSDxMaL', 
      'video_script': 'VR6AewLTigWG4xSOukaG',
      'voice_snippet': 'MF3mGyEYCl7XYWbV9V6O', 
    };

    return voiceMap[content.type] || 'pNInz6obpgDQGcFmaJgB';
  }

  private getVoiceSettingsForTone(tone: string) {
    if (tone.includes('enthusiastic') || tone.includes('energetic')) {
      return {
        stability: 0.3,
        similarity_boost: 0.8,
        style: 0.8,
        use_speaker_boost: true,
      };
    } else if (tone.includes('casual') || tone.includes('authentic')) {
      return {
        stability: 0.6,
        similarity_boost: 0.7,
        style: 0.3,
        use_speaker_boost: false,
      };
    } else if (tone.includes('professional') || tone.includes('warm')) {
      return {
        stability: 0.7,
        similarity_boost: 0.75,
        style: 0.2,
        use_speaker_boost: true,
      };
    }

    
    return {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true,
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export default ElevenLabsService;
export type { VoiceConfig, CampaignGoal, ContentIdea, CampaignPlan };
