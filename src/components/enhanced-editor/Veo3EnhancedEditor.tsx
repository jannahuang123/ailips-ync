"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Type, 
  Sparkles, 
  Settings,
  Download,
  Play,
  Pause,
  RotateCcw,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
// AudioInputSelector removed - Veo3 generates audio natively

interface Veo3EnhancedEditorProps {
  onGenerate: (config: Veo3GenerationConfig) => void;
  userCredits: number;
  isGenerating?: boolean;
  generationProgress?: number;
}

interface Veo3GenerationConfig {
  inputType: 'text' | 'image' | 'video';
  inputData: {
    textPrompt: string; // Always required - describes what to generate
    imageFile?: File;   // Optional: for image-to-video
    videoFile?: File;   // Optional: for video-to-video
  };
  audioSettings: {
    generateAudio: boolean;
    audioPrompt?: string; // Describes the audio/speech to generate
    voiceStyle?: 'natural' | 'professional' | 'casual' | 'dramatic';
    backgroundMusic?: boolean;
    soundEffects?: boolean;
  };
  settings: {
    quality: 'standard' | 'premium' | 'ultra';
    duration: number;
    aspectRatio: '16:9' | '9:16' | '1:1';
    style: 'realistic' | 'cinematic' | 'animated' | 'documentary';
    cameraMovement: 'static' | 'slow_pan' | 'zoom' | 'dynamic';
    lighting: 'natural' | 'studio' | 'dramatic' | 'soft';
  };
  estimatedCredits: number;
}

const QUALITY_PRESETS = {
  standard: {
    name: 'Standard',
    credits: 10,
    description: 'Good quality for social media',
    features: ['1080p output', 'Basic audio generation', 'Standard processing', '30fps']
  },
  premium: {
    name: 'Premium',
    credits: 15,
    description: 'High quality for professional use',
    features: ['4K output', 'High-quality audio', 'Priority processing', 'Advanced effects', '60fps']
  },
  ultra: {
    name: 'Ultra',
    credits: 20,
    description: 'Maximum quality with all features',
    features: ['8K output', 'Studio-quality audio', 'Instant processing', 'Cinematic effects', '120fps']
  }
};

const ASPECT_RATIOS = [
  { value: '16:9', label: 'Landscape (16:9)', icon: '📺' },
  { value: '9:16', label: 'Portrait (9:16)', icon: '📱' },
  { value: '1:1', label: 'Square (1:1)', icon: '⬜' }
];

export default function Veo3EnhancedEditor({ 
  onGenerate, 
  userCredits, 
  isGenerating = false,
  generationProgress = 0 
}: Veo3EnhancedEditorProps) {
  const [inputType, setInputType] = useState<'image' | 'video' | 'text'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [audioData, setAudioData] = useState<any>(null);
  const [quality, setQuality] = useState<'standard' | 'premium' | 'ultra'>('standard');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [duration, setDuration] = useState(10);
  const [lipSyncAccuracy, setLipSyncAccuracy] = useState<'balanced' | 'high' | 'ultra'>('balanced');
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [faceEnhancement, setFaceEnhancement] = useState(false);
  const [voiceCloning, setVoiceCloning] = useState(false);

  const calculateCredits = useCallback(() => {
    let baseCredits = QUALITY_PRESETS[quality].credits;
    
    // Additional features cost
    if (backgroundRemoval) baseCredits += 3;
    if (faceEnhancement) baseCredits += 2;
    if (voiceCloning) baseCredits += 5;
    if (lipSyncAccuracy === 'high') baseCredits += 2;
    if (lipSyncAccuracy === 'ultra') baseCredits += 5;
    
    // Duration multiplier (base is 10 seconds)
    const durationMultiplier = duration / 10;
    
    return Math.ceil(baseCredits * durationMultiplier);
  }, [quality, backgroundRemoval, faceEnhancement, voiceCloning, lipSyncAccuracy, duration]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    toast.success('Image uploaded successfully');
  }, []);

  const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate video
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size must be less than 100MB');
      return;
    }

    setVideoFile(file);
    toast.success('Video uploaded successfully');
  }, []);

  const handleGenerate = useCallback(() => {
    // Validation
    if (!audioData) {
      toast.error('Please add audio input');
      return;
    }

    if (inputType === 'image' && !imageFile) {
      toast.error('Please upload an image');
      return;
    }

    if (inputType === 'video' && !videoFile) {
      toast.error('Please upload a video');
      return;
    }

    if (inputType === 'text' && !textPrompt.trim()) {
      toast.error('Please enter a text prompt');
      return;
    }

    const estimatedCredits = calculateCredits();
    if (estimatedCredits > userCredits) {
      toast.error(`Insufficient credits. Need ${estimatedCredits}, have ${userCredits}`);
      return;
    }

    const config: Veo3GenerationConfig = {
      inputType,
      inputData: {
        imageFile: inputType === 'image' ? (imageFile || undefined) : undefined,
        videoFile: inputType === 'video' ? (videoFile || undefined) : undefined,
        textPrompt: inputType === 'text' ? (textPrompt || '') : '',
      },
      audioSettings: {
        generateAudio: true,
        audioPrompt: 'Generate natural speech',
        voiceStyle: 'natural',
        backgroundMusic: false,
        soundEffects: false,
      },
      settings: {
        quality,
        duration,
        aspectRatio,
        style: 'realistic',
        cameraMovement: 'static',
        lighting: 'natural',
      },
      estimatedCredits,
    };

    onGenerate(config);
  }, [
    inputType, imageFile, videoFile, textPrompt, quality, duration,
    aspectRatio, calculateCredits, userCredits, onGenerate
  ]);

  const resetEditor = useCallback(() => {
    setImageFile(null);
    setVideoFile(null);
    setTextPrompt('');
    setAudioData(null);
    setQuality('standard');
    setAspectRatio('16:9');
    setDuration(10);
    setLipSyncAccuracy('balanced');
    setBackgroundRemoval(false);
    setFaceEnhancement(false);
    setVoiceCloning(false);
  }, []);

  const estimatedCredits = calculateCredits();
  const canGenerate = audioData && (
    (inputType === 'image' && imageFile) ||
    (inputType === 'video' && videoFile) ||
    (inputType === 'text' && textPrompt.trim())
  ) && estimatedCredits <= userCredits;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Veo3 Enhanced Editor
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create professional lip-sync videos with Google's Veo3 AI technology
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {userCredits} Credits
              </Badge>
              <Button variant="outline" onClick={resetEditor} disabled={isGenerating}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visual Input</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={inputType} onValueChange={(value) => setInputType(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text Prompt
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    {imageFile ? (
                      <div className="space-y-4">
                        <img 
                          src={URL.createObjectURL(imageFile)} 
                          alt="Preview" 
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">{imageFile.name}</p>
                        <Button variant="outline" onClick={() => setImageFile(null)}>
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload a portrait image for lip sync
                        </p>
                        <Button onClick={() => document.getElementById('image-upload')?.click()}>
                          Choose Image
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Supported: JPG, PNG, WebP • Max: 10MB
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    {videoFile ? (
                      <div className="space-y-4">
                        <video 
                          src={URL.createObjectURL(videoFile)} 
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                          controls
                        />
                        <p className="text-sm text-muted-foreground">{videoFile.name}</p>
                        <Button variant="outline" onClick={() => setVideoFile(null)}>
                          Remove Video
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload a video for enhanced lip sync
                        </p>
                        <Button onClick={() => document.getElementById('video-upload')?.click()}>
                          Choose Video
                        </Button>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Supported: MP4, MOV, WebM • Max: 100MB
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-4">
                  <div className="space-y-4">
                    <textarea
                      placeholder="Describe the person or character you want to create (e.g., 'A professional businesswoman in her 30s with brown hair, wearing a blue suit, speaking confidently')"
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      className="w-full h-32 p-3 border rounded-lg resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {textPrompt.length}/500 characters • Be specific about appearance and setting
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Audio Input - Veo3 generates audio natively */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audio Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Veo3 generates high-quality audio automatically based on your video content.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Settings & Generation */}
        <div className="space-y-6">
          {/* Quality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quality Preset */}
              <div>
                <label className="text-sm font-medium mb-3 block">Quality Preset</label>
                <div className="space-y-2">
                  {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                    <div
                      key={key}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        quality === key ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
                      }`}
                      onClick={() => setQuality(key as any)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{preset.name}</span>
                        <Badge variant="secondary">{preset.credits} credits</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{preset.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {preset.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-sm font-medium mb-3 block">Aspect Ratio</label>
                <div className="grid grid-cols-1 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <Button
                      key={ratio.value}
                      variant={aspectRatio === ratio.value ? "default" : "outline"}
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className="justify-start"
                    >
                      <span className="mr-2">{ratio.icon}</span>
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Duration: {duration} seconds
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5s</span>
                  <span>60s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Estimated Cost:</span>
                <Badge variant={estimatedCredits <= userCredits ? "default" : "destructive"}>
                  {estimatedCredits} credits
                </Badge>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>

              {!canGenerate && !isGenerating && (
                <p className="text-xs text-muted-foreground text-center">
                  {estimatedCredits > userCredits 
                    ? 'Insufficient credits' 
                    : 'Please complete all required inputs'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
