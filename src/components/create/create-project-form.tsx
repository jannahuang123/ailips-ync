"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Video, Music, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProjectFormData {
  title: string;
  description: string;
  videoFile: File | null;
  audioFile: File | null;
}

export default function CreateProjectForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    videoFile: null,
    audioFile: null,
  });

  const handleFileChange = (type: 'video' | 'audio', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [`${type}File`]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    
    if (!formData.videoFile) {
      toast.error("Please upload a video file");
      return;
    }
    
    if (!formData.audioFile) {
      toast.error("Please upload an audio file");
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement project creation API
      console.log("Creating project with:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Project created successfully!");
      router.push("/my-projects");
      
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Give your lip sync project a name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="Enter project title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video File *
            </CardTitle>
            <CardDescription>
              Upload the video you want to sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              accept="video/*"
              file={formData.videoFile}
              onFileChange={(file) => handleFileChange('video', file)}
              placeholder="Drop video file here or click to browse"
              icon={<Video className="w-8 h-8 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        {/* Audio Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Audio File *
            </CardTitle>
            <CardDescription>
              Upload the audio for lip sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              accept="audio/*"
              file={formData.audioFile}
              onFileChange={(file) => handleFileChange('audio', file)}
              placeholder="Drop audio file here or click to browse"
              icon={<Music className="w-8 h-8 text-muted-foreground" />}
            />
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Project...
            </>
          ) : (
            "Create Project"
          )}
        </Button>
      </div>
    </form>
  );
}

// File Uploader Component
interface FileUploaderProps {
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  placeholder: string;
  icon: React.ReactNode;
}

function FileUploader({ accept, file, onFileChange, placeholder, icon }: FileUploaderProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0] || null;
    if (droppedFile && droppedFile.type.startsWith(accept.replace('/*', ''))) {
      onFileChange(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={`file-${accept}`}
      />
      <label htmlFor={`file-${accept}`} className="cursor-pointer">
        {file ? (
          <div className="space-y-2">
            <div className="text-green-600">{icon}</div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">{icon}</div>
            <p className="text-sm text-muted-foreground">{placeholder}</p>
            <Button type="button" variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
        )}
      </label>
    </div>
  );
}
