'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestTTSPage() {
  const { data: session, status } = useSession();
  const [text, setText] = useState('Hello, this is a test message.');
  const [voice, setVoice] = useState('apicore-en-US-female');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<any[]>([]);
  const [providers, setProviders] = useState<any>({});

  // Load available voices
  const loadVoices = async () => {
    try {
      const response = await fetch('/api/tts/generate');
      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices || []);
        setProviders(data.providers || {});
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  };

  // Generate TTS
  const generateTTS = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: voice,
          format: 'mp3'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Create audio URL from response
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Load voices on component mount
  useState(() => {
    loadVoices();
  });

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">TTS Test Page</h1>
        <p className="text-red-600">Please log in to test TTS functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">TTS API Test</h1>
      
      {/* Provider Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Provider Status</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>APICore.ai: {providers.apicore ? '✅' : '❌'}</div>
          <div>OpenAI: {providers.openai ? '✅' : '❌'}</div>
          <div>Azure: {providers.azure ? '✅' : '❌'}</div>
          <div>Google: {providers.google ? '✅' : '❌'}</div>
          <div>Demo Mode: {providers.demo ? '✅' : '❌'}</div>
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Text to Speech:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={3}
          placeholder="Enter text to convert to speech..."
        />
      </div>

      {/* Voice Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Voice:
        </label>
        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.language})
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateTTS}
        disabled={isGenerating || !text.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {isGenerating ? 'Generating...' : 'Generate Speech'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-green-800">Generated Audio:</h3>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="mt-2">
            <a
              href={audioUrl}
              download="generated-speech.mp3"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Download Audio
            </a>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enter text in the textarea above</li>
          <li>• Select a voice from the dropdown</li>
          <li>• Click "Generate Speech" to create audio</li>
          <li>• If no API keys are configured, demo mode will be used</li>
          <li>• Demo mode generates a simple tone instead of actual speech</li>
        </ul>
      </div>
    </div>
  );
}
