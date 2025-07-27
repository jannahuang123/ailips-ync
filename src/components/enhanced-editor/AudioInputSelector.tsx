"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Mic, 
  Upload, 
  Type, 
  Play, 
  Pause, 
  Square,
  Volume2,
  Download,
  Trash2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface AudioInputSelectorProps {
  onAudioSelect: (audioData: AudioData) => void;
  maxDuration?: number; // seconds
  supportedFormats?: string[];
}

interface AudioData {
  type: 'upload' | 'record' | 'tts';
  file?: File;
  blob?: Blob;
  url?: string;
  text?: string;
  voice?: string;
  duration?: number;
  metadata?: {
    sampleRate?: number;
    channels?: number;
    bitRate?: number;
  };
}

interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  preview?: string;
}

const TTS_VOICES: TTSVoice[] = [
  { id: 'en-US-neural-jenny', name: 'Jenny (US)', language: 'en-US', gender: 'female' },
  { id: 'en-US-neural-guy', name: 'Guy (US)', language: 'en-US', gender: 'male' },
  { id: 'zh-CN-neural-xiaoxiao', name: '晓晓 (中文)', language: 'zh-CN', gender: 'female' },
  { id: 'zh-CN-neural-yunxi', name: '云希 (中文)', language: 'zh-CN', gender: 'male' },
  { id: 'ja-JP-neural-nanami', name: 'Nanami (日本)', language: 'ja-JP', gender: 'female' },
  { id: 'ko-KR-neural-sun-hi', name: 'Sun-Hi (한국)', language: 'ko-KR', gender: 'female' },
];

export default function AudioInputSelector({ 
  onAudioSelect, 
  maxDuration = 300,
  supportedFormats = ['mp3', 'wav', 'm4a', 'ogg']
}: AudioInputSelectorProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'tts'>('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // TTS State
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>(TTS_VOICES[0].id);
  const [speechRate, setSpeechRate] = useState([1]);
  const [speechPitch, setSpeechPitch] = useState([1]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // File Upload Handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      toast.error(`Unsupported format. Please use: ${supportedFormats.join(', ')}`);
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAudioPreview(previewUrl);

    // Get audio metadata
    const audio = new Audio(previewUrl);
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration > maxDuration) {
        toast.error(`Audio duration must be less than ${maxDuration} seconds`);
        URL.revokeObjectURL(previewUrl);
        setAudioPreview(null);
        return;
      }

      const audioData: AudioData = {
        type: 'upload',
        file,
        url: previewUrl,
        duration: audio.duration,
        metadata: {
          // These would be extracted from actual audio analysis
          sampleRate: 44100,
          channels: 2,
          bitRate: 128
        }
      };

      onAudioSelect(audioData);
      toast.success('Audio file uploaded successfully');
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [supportedFormats, maxDuration, onAudioSelect]);

  // Recording Functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const previewUrl = URL.createObjectURL(audioBlob);
        setAudioPreview(previewUrl);

        const audioData: AudioData = {
          type: 'record',
          blob: audioBlob,
          url: previewUrl,
          duration: recordingTime,
          metadata: {
            sampleRate: 44100,
            channels: 1,
            bitRate: 128
          }
        };

        onAudioSelect(audioData);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, [maxDuration, onAudioSelect, recordingTime]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      toast.success('Recording completed');
    }
  }, [isRecording]);

  // TTS Functions
  const generateTTS = useCallback(async () => {
    if (!ttsText.trim()) {
      toast.error('Please enter text to convert to speech');
      return;
    }

    if (ttsText.length > 1000) {
      toast.error('Text must be less than 1000 characters');
      return;
    }

    setIsGenerating(true);

    try {
      // This would call your TTS API
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ttsText,
          voice: selectedVoice,
          rate: speechRate[0],
          pitch: speechPitch[0],
        }),
      });

      if (!response.ok) {
        throw new Error('TTS generation failed');
      }

      const audioBlob = await response.blob();
      const previewUrl = URL.createObjectURL(audioBlob);
      setAudioPreview(previewUrl);

      const audioData: AudioData = {
        type: 'tts',
        blob: audioBlob,
        url: previewUrl,
        text: ttsText,
        voice: selectedVoice,
        duration: 0, // Would be calculated from actual audio
        metadata: {
          sampleRate: 22050,
          channels: 1,
          bitRate: 64
        }
      };

      onAudioSelect(audioData);
      toast.success('Text-to-speech generated successfully');
    } catch (error) {
      console.error('TTS generation error:', error);
      toast.error('Failed to generate speech. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [ttsText, selectedVoice, speechRate, speechPitch, onAudioSelect]);

  // Audio Preview Controls
  const togglePlayback = useCallback(() => {
    if (!audioPreviewRef.current || !audioPreview) return;

    if (isPlaying) {
      audioPreviewRef.current.pause();
    } else {
      audioPreviewRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, audioPreview]);

  const clearAudio = useCallback(() => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
    }
    setIsPlaying(false);
    setRecordingTime(0);
  }, [audioPreview]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Audio Input</h3>
            <p className="text-sm text-muted-foreground">
              Choose how you want to add audio to your video
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Record
              </TabsTrigger>
              <TabsTrigger value="tts" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text-to-Speech
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop an audio file, or click to browse
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose Audio File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={supportedFormats.map(f => `.${f}`).join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: {supportedFormats.join(', ')} • Max: 50MB • Duration: {maxDuration}s
                </p>
              </div>
            </TabsContent>

            <TabsContent value="record" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  {!isRecording ? (
                    <Button onClick={startRecording} size="lg" className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={pauseRecording} 
                        variant="outline" 
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button 
                        onClick={stopRecording} 
                        variant="destructive" 
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        <Square className="w-5 h-5" />
                        Stop
                      </Button>
                    </div>
                  )}
                </div>
                
                {isRecording && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
                      <span className="text-sm text-muted-foreground">/ {formatTime(maxDuration)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tts" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Text to Convert</label>
                  <Textarea
                    placeholder="Enter the text you want to convert to speech..."
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {ttsText.length}/1000 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Voice</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TTS_VOICES.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name} ({voice.gender})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Speech Rate: {speechRate[0]}x
                    </label>
                    <Slider
                      value={speechRate}
                      onValueChange={setSpeechRate}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button 
                  onClick={generateTTS} 
                  disabled={!ttsText.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Speech'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Audio Preview */}
          {audioPreview && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayback}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <span className="text-sm text-muted-foreground">Audio Preview</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={clearAudio}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <audio
                  ref={audioPreviewRef}
                  src={audioPreview}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
