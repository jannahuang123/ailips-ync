"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Play, Video, Image, Mic, Settings, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LipSyncEditorProps {
  userCredits?: number;
  onGenerate?: (data: any) => void;
  loading?: boolean;
}

export default function LipSyncEditor({ userCredits = 50, onGenerate, loading = false }: LipSyncEditorProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"photo" | "video">("photo");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [scriptText, setScriptText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("emily");
  const [enableSubtitles, setEnableSubtitles] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioInputMode, setAudioInputMode] = useState<"text" | "upload" | "record">("text");
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");

  const photoDropzone = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }, [])
  });

  const videoDropzone = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 30 * 1024 * 1024, // 30MB
    multiple: false,
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }, [])
  });

  const audioDropzone = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedAudio(file);
        toast.success(`Audio file "${file.name}" uploaded successfully!`);
      }
    }, [])
  });

  const handleRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        toast.success("Recording started... Speak now!");

        // Simulate recording and speech-to-text
        setTimeout(() => {
          setIsRecording(false);
          setRecordedText("This is a simulated transcription of your recorded audio.");
          toast.success("Recording completed and transcribed!");
          stream.getTracks().forEach(track => track.stop());
        }, 5000);
      } catch (error) {
        toast.error("Could not access microphone. Please check permissions.");
      }
    } else {
      // Stop recording
      setIsRecording(false);
      toast.info("Recording stopped.");
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file to generate");
      return;
    }

    // Check if we have audio content based on mode
    const hasAudioContent =
      (audioInputMode === "text" && scriptText.trim()) ||
      (audioInputMode === "upload" && uploadedAudio) ||
      (audioInputMode === "record" && recordedText.trim());

    if (!hasAudioContent) {
      toast.error("Please provide audio content (text, upload, or record)");
      return;
    }

    // Use ShipAny credit system - medium quality costs 10 credits
    const creditsNeeded = 10;
    if (userCredits < creditsNeeded) {
      toast.error(`Insufficient credits. You need ${creditsNeeded} credits to generate.`);
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Step 1: Upload the file first
      toast.info("Uploading file...");
      const uploadFormData = new FormData();
      uploadFormData.append('file', uploadedFile);

      const uploadEndpoint = activeTab === 'photo' ? '/api/upload/image' : '/api/upload/video';
      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: uploadFormData
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      const { url: fileUrl } = await uploadResponse.json();
      setProgress(20);

      // Step 2: Handle audio based on mode
      let audioUrl = '';
      let audioPrompt = '';

      if (audioInputMode === "text") {
        // Use text directly for Veo3 audio generation (no TTS needed)
        toast.info("Preparing text for audio generation...");
        audioPrompt = scriptText;
        // audioUrl remains empty - Veo3 will generate audio from text
      } else if (audioInputMode === "upload" && uploadedAudio) {
        // Upload audio file
        const audioFormData = new FormData();
        audioFormData.append('file', uploadedAudio);

        const audioUploadResponse = await fetch('/api/upload/audio', {
          method: 'POST',
          body: audioFormData
        });

        if (!audioUploadResponse.ok) {
          throw new Error('Audio upload failed');
        }

        const audioResult = await audioUploadResponse.json();
        audioUrl = audioResult.url;
      } else if (audioInputMode === "record") {
        // For recorded audio, use the transcribed text for Veo3 audio generation
        audioPrompt = recordedText;
        // audioUrl remains empty - Veo3 will generate audio from text
      }

      setProgress(40);

      // Step 3: Create LipSync project
      toast.info("Starting AI processing...");
      const projectResponse = await fetch('/api/lipsync/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `LipSync ${Date.now()}`,
          imageUrl: fileUrl,  // For photos, use imageUrl
          audioUrl: audioUrl,
          audioPrompt: audioPrompt, // Pass text for Veo3 audio generation
          quality: 'medium'   // Fixed medium quality for 10 credits
        })
      });

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const projectResult = await projectResponse.json();
      setProgress(60);

      // Step 4: Poll for completion
      toast.info("Processing video... This may take a few minutes.");
      const projectId = projectResult.projectId;

      const pollStatus = async (): Promise<void> => {
        const statusResponse = await fetch(`/api/lipsync/status/${projectId}`);

        if (!statusResponse.ok) {
          throw new Error('Failed to check status');
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          setProgress(100);
          toast.success("Video generated successfully!");

          // Call onGenerate callback with result
          if (onGenerate) {
            onGenerate({
              projectId,
              resultUrl: statusData.resultUrl,
              file: uploadedFile,
              audioMode: audioInputMode,
              text: audioInputMode === "text" ? scriptText : recordedText,
              voice: selectedVoice,
              type: activeTab,
              subtitles: enableSubtitles
            });
          }

          setIsGenerating(false);
          setTimeout(() => setProgress(0), 3000);
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Video generation failed');
        } else {
          // Still processing, update progress
          setProgress(60 + (statusData.progress || 0) * 0.4);
          setTimeout(pollStatus, 3000); // Poll every 3 seconds
        }
      };

      // Start polling
      setTimeout(pollStatus, 2000);

    } catch (error) {
      console.error("Generation failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate video. Please try again.");
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const currentDropzone = activeTab === "photo" ? photoDropzone : videoDropzone;
  const maxSize = activeTab === "photo" ? "10MB" : "30MB";
  const acceptedFormats = activeTab === "photo" ? "JPG, PNG, WebP" : "MP4, MOV, AVI";

  return (
    <div className="w-full max-w-[950px] mx-auto">
      <Card className={cn(
        "shadow-2xl transition-colors duration-200",
        "bg-card border-border text-card-foreground"
      )}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '700px', maxHeight: '750px' }}>
            
            {/* Left Panel - Upload & Controls */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Tab Switcher */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "photo" | "video")}>
                <TabsList className={cn(
                  "grid w-full grid-cols-2 transition-colors",
                  "bg-muted border-border"
                )}>
                  <TabsTrigger
                    value="photo"
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      "data-[state=active]:bg-background data-[state=active]:text-foreground",
                      "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Image className="w-4 h-4" />
                    Upload Photo
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      "data-[state=active]:bg-background data-[state=active]:text-foreground",
                      "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Video className="w-4 h-4" />
                    Upload Video
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photo" className="mt-4">
                  <div
                    {...photoDropzone.getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                      photoDropzone.isDragActive
                        ? 'border-green-500 bg-green-500/10 dark:bg-green-500/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <input {...photoDropzone.getInputProps()} />
                    <Upload className={cn(
                      "w-12 h-12 mx-auto mb-4 transition-colors",
                      "text-muted-foreground"
                    )} />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">AI Lip Sync</h3>
                    <p className="text-muted-foreground mb-2 font-medium">Click or drag photo here</p>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">
                      Upload a clear, well-lit photo (max {maxSize}) with the face always visible and no black or faceless frames.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2 font-medium">Supported: {acceptedFormats}</p>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-4">
                  <div
                    {...videoDropzone.getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                      videoDropzone.isDragActive
                        ? 'border-green-500 bg-green-500/10 dark:bg-green-500/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <input {...videoDropzone.getInputProps()} />
                    <Upload className={cn(
                      "w-12 h-12 mx-auto mb-4 transition-colors",
                      "text-muted-foreground"
                    )} />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">AI Lip Sync</h3>
                    <p className="text-muted-foreground mb-2 font-medium">Click or drag video here</p>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">
                      Upload a clear, well-lit 10-30s video (max {maxSize}) with the face always visible and no black or faceless frames.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2 font-medium">Supported: {acceptedFormats}</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Audio Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Want Avatar to Say?</h4>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    <Button
                      variant={audioInputMode === "text" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAudioInputMode("text")}
                      className={cn(
                        "text-xs px-3 py-1 h-8",
                        audioInputMode === "text"
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Mic className="w-3 h-3 mr-1" />
                      Text to Speech
                    </Button>
                    <Button
                      variant={audioInputMode === "upload" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAudioInputMode("upload")}
                      className={cn(
                        "text-xs px-3 py-1 h-8",
                        audioInputMode === "upload"
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Upload
                    </Button>
                    <Button
                      variant={audioInputMode === "record" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAudioInputMode("record")}
                      className={cn(
                        "text-xs px-3 py-1 h-8",
                        audioInputMode === "record"
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Record
                    </Button>
                  </div>
                </div>
                
                {/* Text to Speech Mode */}
                {audioInputMode === "text" && (
                  <>
                    <Textarea
                      placeholder="Type what you want the avatar to say..."
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                      className={cn(
                        "min-h-[100px] resize-none transition-colors",
                        "bg-background border-border text-foreground",
                        "placeholder:text-muted-foreground/60",
                        "focus:border-primary focus:ring-1 focus:ring-primary"
                      )}
                      maxLength={500}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Translate
                        </Button>
                        <span className="text-muted-foreground font-medium">{scriptText.length} / 500</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Upload Audio Mode */}
                {audioInputMode === "upload" && (
                  <div
                    {...audioDropzone.getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
                      audioDropzone.isDragActive
                        ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <input {...audioDropzone.getInputProps()} />
                    <Upload className={cn(
                      "w-8 h-8 mx-auto mb-3 transition-colors",
                      "text-muted-foreground"
                    )} />
                    <h4 className="text-base font-semibold mb-2 text-foreground">Upload Audio</h4>
                    <p className="text-muted-foreground mb-2 font-medium">
                      {uploadedAudio ? `Selected: ${uploadedAudio.name}` : "Click or drag audio file here"}
                    </p>
                    <p className="text-xs text-muted-foreground/60 font-medium">
                      Supported: MP3, WAV, M4A, AAC (max 10MB)
                    </p>
                  </div>
                )}

                {/* Record Audio Mode */}
                {audioInputMode === "record" && (
                  <div className="space-y-4">
                    <div className="text-center p-6 border-2 border-dashed border-border rounded-lg">
                      <Button
                        onClick={handleRecording}
                        disabled={isGenerating}
                        className={cn(
                          "w-full font-semibold py-3 transition-all duration-200",
                          isRecording
                            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                        size="lg"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isRecording ? "Recording... (Click to stop)" : "Record Audio"}
                      </Button>

                      {isRecording && (
                        <p className="text-sm text-muted-foreground mt-2 animate-pulse">
                          🎤 Listening... Speak clearly into your microphone
                        </p>
                      )}
                    </div>

                    {recordedText && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h5 className="text-sm font-semibold text-foreground mb-2">Transcribed Text:</h5>
                        <p className="text-sm text-muted-foreground leading-relaxed">{recordedText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Voice</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className={cn(
                    "bg-background border-border text-foreground",
                    "hover:bg-muted focus:border-primary"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="emily" className="text-popover-foreground hover:bg-muted">Emily</SelectItem>
                    <SelectItem value="david" className="text-popover-foreground hover:bg-muted">David</SelectItem>
                    <SelectItem value="sarah" className="text-popover-foreground hover:bg-muted">Sarah</SelectItem>
                    <SelectItem value="michael" className="text-popover-foreground hover:bg-muted">Michael</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subtitles"
                  checked={enableSubtitles}
                  onCheckedChange={(checked) => setEnableSubtitles(checked === true)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="subtitles" className="text-sm font-medium text-foreground">Enable subtitles</label>
              </div>

              {/* Generate Button */}
              <div className="space-y-3">
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-foreground">Generating...</span>
                      <span className="text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress
                      value={progress}
                      className={cn(
                        "bg-muted",
                        "[&>div]:bg-primary [&>div]:transition-all"
                      )}
                    />
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={
                    !uploadedFile ||
                    isGenerating ||
                    (audioInputMode === "text" && !scriptText.trim()) ||
                    (audioInputMode === "upload" && !uploadedAudio) ||
                    (audioInputMode === "record" && !recordedText.trim())
                  }
                  className={cn(
                    "w-full font-semibold py-3 transition-all duration-200",
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  size="lg"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Cost: 10 credits</span>
                  <span className="text-foreground font-semibold">
                    Your balance: {loading ? "..." : userCredits} credits
                  </span>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="space-y-4">
              <div className={cn(
                "rounded-lg p-4 h-[250px] flex items-center justify-center transition-colors",
                "bg-muted border border-border"
              )}>
                {previewUrl ? (
                  activeTab === "photo" ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain rounded shadow-sm"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      className="max-w-full max-h-full object-contain rounded shadow-sm"
                      controls
                    />
                  )
                ) : (
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-lg mx-auto mb-3 flex items-center justify-center transition-colors",
                      "bg-background border border-border text-muted-foreground"
                    )}>
                      <span className="text-sm font-medium">Sample</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Preview will appear here</p>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p className="font-medium">Jan 1, 12:00</p>
                <p className="text-xs">12:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
