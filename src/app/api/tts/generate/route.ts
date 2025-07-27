import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

interface TTSRequest {
  text: string;
  voice: string;
  rate?: number;
  pitch?: number;
  format?: 'mp3' | 'wav' | 'ogg';
}

interface TTSVoiceConfig {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  provider: 'azure' | 'google' | 'openai';
  voiceId: string;
}

const TTS_VOICES: Record<string, TTSVoiceConfig> = {
  'en-US-neural-jenny': {
    id: 'en-US-neural-jenny',
    name: 'Jenny (US)',
    language: 'en-US',
    gender: 'female',
    provider: 'azure',
    voiceId: 'en-US-JennyNeural'
  },
  'en-US-neural-guy': {
    id: 'en-US-neural-guy',
    name: 'Guy (US)',
    language: 'en-US',
    gender: 'male',
    provider: 'azure',
    voiceId: 'en-US-GuyNeural'
  },
  'zh-CN-neural-xiaoxiao': {
    id: 'zh-CN-neural-xiaoxiao',
    name: '晓晓 (中文)',
    language: 'zh-CN',
    gender: 'female',
    provider: 'azure',
    voiceId: 'zh-CN-XiaoxiaoNeural'
  },
  'zh-CN-neural-yunxi': {
    id: 'zh-CN-neural-yunxi',
    name: '云希 (中文)',
    language: 'zh-CN',
    gender: 'male',
    provider: 'azure',
    voiceId: 'zh-CN-YunxiNeural'
  }
};

// Azure Cognitive Services TTS
async function generateAzureTTS(
  text: string, 
  voiceConfig: TTSVoiceConfig, 
  rate: number = 1, 
  pitch: number = 1
): Promise<ArrayBuffer> {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || 'eastus';

  if (!subscriptionKey) {
    throw new Error('Azure Speech Service key not configured');
  }

  // Get access token
  const tokenResponse = await fetch(
    `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  if (!tokenResponse.ok) {
    throw new Error('Failed to get Azure access token');
  }

  const accessToken = await tokenResponse.text();

  // Convert rate and pitch to SSML format
  const ratePercent = Math.round((rate - 1) * 100);
  const pitchHz = Math.round((pitch - 1) * 50);
  
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voiceConfig.language}">
      <voice name="${voiceConfig.voiceId}">
        <prosody rate="${ratePercent >= 0 ? '+' : ''}${ratePercent}%" pitch="${pitchHz >= 0 ? '+' : ''}${pitchHz}Hz">
          ${text}
        </prosody>
      </voice>
    </speak>
  `;

  // Generate speech
  const speechResponse = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'LipSyncVideo'
      },
      body: ssml
    }
  );

  if (!speechResponse.ok) {
    const errorText = await speechResponse.text();
    throw new Error(`Azure TTS failed: ${errorText}`);
  }

  return await speechResponse.arrayBuffer();
}

// Google Cloud TTS (alternative)
async function generateGoogleTTS(
  text: string, 
  voiceConfig: TTSVoiceConfig, 
  rate: number = 1, 
  pitch: number = 1
): Promise<ArrayBuffer> {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Cloud API key not configured');
  }

  const requestBody = {
    input: { text },
    voice: {
      languageCode: voiceConfig.language,
      name: voiceConfig.voiceId,
      ssmlGender: voiceConfig.gender.toUpperCase()
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: rate,
      pitch: (pitch - 1) * 20, // Convert to semitones
      volumeGainDb: 0,
      sampleRateHertz: 22050
    }
  };

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Google TTS failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Decode base64 audio data
  const audioBytes = Buffer.from(data.audioContent, 'base64');
  return audioBytes.buffer;
}

// OpenAI TTS (alternative)
async function generateOpenAITTS(
  text: string, 
  voiceConfig: TTSVoiceConfig, 
  rate: number = 1
): Promise<ArrayBuffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Map voice to OpenAI voice names
  const openAIVoiceMap: Record<string, string> = {
    'en-US-neural-jenny': 'nova',
    'en-US-neural-guy': 'onyx',
    'zh-CN-neural-xiaoxiao': 'nova', // Fallback for Chinese
    'zh-CN-neural-yunxi': 'onyx'
  };

  const voice = openAIVoiceMap[voiceConfig.id] || 'nova';

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: text,
      voice: voice,
      speed: Math.max(0.25, Math.min(4.0, rate)) // OpenAI speed range
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI TTS failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  return await response.arrayBuffer();
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: TTSRequest = await request.json();
    const { text, voice, rate = 1, pitch = 1, format = 'mp3' } = body;

    // Validation
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Text must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (!voice || !TTS_VOICES[voice]) {
      return NextResponse.json(
        { error: 'Invalid voice selection' },
        { status: 400 }
      );
    }

    if (rate < 0.5 || rate > 2.0) {
      return NextResponse.json(
        { error: 'Rate must be between 0.5 and 2.0' },
        { status: 400 }
      );
    }

    if (pitch < 0.5 || pitch > 2.0) {
      return NextResponse.json(
        { error: 'Pitch must be between 0.5 and 2.0' },
        { status: 400 }
      );
    }

    const voiceConfig = TTS_VOICES[voice];
    let audioBuffer: ArrayBuffer;

    // Try different TTS providers based on configuration and availability
    try {
      if (voiceConfig.provider === 'azure' && process.env.AZURE_SPEECH_KEY) {
        audioBuffer = await generateAzureTTS(text, voiceConfig, rate, pitch);
      } else if (voiceConfig.provider === 'google' && process.env.GOOGLE_CLOUD_API_KEY) {
        audioBuffer = await generateGoogleTTS(text, voiceConfig, rate, pitch);
      } else if (process.env.OPENAI_API_KEY) {
        audioBuffer = await generateOpenAITTS(text, voiceConfig, rate);
      } else {
        throw new Error('No TTS provider configured');
      }
    } catch (primaryError) {
      console.error('Primary TTS provider failed:', primaryError);
      
      // Fallback to OpenAI if available
      if (process.env.OPENAI_API_KEY && voiceConfig.provider !== 'openai') {
        try {
          audioBuffer = await generateOpenAITTS(text, voiceConfig, rate);
        } catch (fallbackError) {
          console.error('Fallback TTS provider failed:', fallbackError);
          throw primaryError;
        }
      } else {
        throw primaryError;
      }
    }

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Content-Length', audioBuffer.byteLength.toString());
    headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Add metadata headers
    headers.set('X-Voice-ID', voice);
    headers.set('X-Voice-Name', voiceConfig.name);
    headers.set('X-Voice-Language', voiceConfig.language);
    headers.set('X-Audio-Duration', '0'); // Would need actual audio analysis
    headers.set('X-Provider', voiceConfig.provider);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('TTS generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
export async function GET() {
  try {
    const voices = Object.values(TTS_VOICES).map(voice => ({
      id: voice.id,
      name: voice.name,
      language: voice.language,
      gender: voice.gender,
      provider: voice.provider
    }));

    return NextResponse.json({
      voices,
      providers: {
        azure: !!process.env.AZURE_SPEECH_KEY,
        google: !!process.env.GOOGLE_CLOUD_API_KEY,
        openai: !!process.env.OPENAI_API_KEY
      }
    });
  } catch (error) {
    console.error('Error listing TTS voices:', error);
    return NextResponse.json(
      { error: 'Failed to list voices' },
      { status: 500 }
    );
  }
}
