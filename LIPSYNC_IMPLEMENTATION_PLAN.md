# 🚀 LipSync Editor Implementation Plan

## 📊 **ShipAny Route Analysis**

### **Existing Route Structure**
```
src/app/[locale]/(default)/
├── page.tsx                    # Homepage with LipSync Editor ✅
├── create/                     # Project creation page (exists)
├── pricing/                    # Pricing page ✅
└── (console)/
    ├── my-projects/           # Project management ✅
    ├── my-credits/            # Credit management ✅
    └── my-orders/             # Order history ✅

src/app/api/
├── lipsync/
│   ├── create/               # Project creation API ✅
│   ├── generate/             # Generation API
│   └── status/[id]/          # Status checking API
├── upload/
│   ├── video/                # Video upload API ✅
│   └── audio/                # Audio upload API ✅
├── tts/generate/             # Text-to-Speech API ✅
└── checkout/                 # Payment API ✅
```

## 🎯 **Implementation Strategy**

### **Phase 1: Editor Integration (Current)**
✅ **Completed:**
- LipSync Editor component created
- Integrated into homepage below hero section
- Height optimized (reduced by 100px)
- English-only interface
- 5 credits unified pricing

### **Phase 2: API Integration (Next Steps)**

#### **2.1 Update Editor to Use Existing APIs**
```typescript
// Update LipSyncEditor.tsx to integrate with existing APIs
const handleGenerate = async () => {
  try {
    // Step 1: Upload file using existing upload API
    const uploadUrl = activeTab === "photo" 
      ? "/api/upload/video"  // Reuse video upload for images
      : "/api/upload/video";
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    const { url: fileUrl } = await uploadResponse.json();
    
    // Step 2: Generate audio using TTS API
    const ttsResponse = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: scriptText,
        voice: selectedVoice,
        format: 'mp3'
      })
    });
    
    const { audioUrl } = await ttsResponse.json();
    
    // Step 3: Create LipSync project
    const projectResponse = await fetch('/api/lipsync/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `LipSync ${Date.now()}`,
        imageUrl: fileUrl,  // For photos
        audioUrl: audioUrl,
        quality: 'medium'   // Fixed 5 credits
      })
    });
    
    const { projectId } = await projectResponse.json();
    
    // Step 4: Poll for status
    pollProjectStatus(projectId);
    
  } catch (error) {
    console.error('Generation failed:', error);
    toast.error('Generation failed. Please try again.');
  }
};
```

#### **2.2 Create Status Polling System**
```typescript
const pollProjectStatus = async (projectId: string) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/lipsync/status/${projectId}`);
      const { status, progress, result_url } = await response.json();
      
      setProgress(progress);
      
      if (status === 'completed') {
        clearInterval(pollInterval);
        setProgress(100);
        toast.success('Video generated successfully!');
        // Show download link
        setResultUrl(result_url);
      } else if (status === 'failed') {
        clearInterval(pollInterval);
        toast.error('Generation failed');
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  }, 2000);
};
```

### **Phase 3: User Experience Enhancements**

#### **3.1 Credit Integration**
```typescript
// Add real credit checking
const [userCredits, setUserCredits] = useState(0);

useEffect(() => {
  fetchUserCredits();
}, []);

const fetchUserCredits = async () => {
  try {
    const response = await fetch('/api/get-user-credits');
    const { left_credits } = await response.json();
    setUserCredits(left_credits);
  } catch (error) {
    console.error('Failed to fetch credits:', error);
  }
};
```

#### **3.2 Project Management Integration**
```typescript
// Redirect to project page after generation
const handleGenerationComplete = (projectId: string) => {
  toast.success('Video generated successfully!');
  router.push(`/my-projects?highlight=${projectId}`);
};
```

## 🔧 **Required Code Changes**

### **1. Update LipSyncEditor Component**
```typescript
// File: src/components/lipsync/LipSyncEditor.tsx
// Changes needed:
- Replace mock API calls with real API integration
- Add proper error handling
- Implement status polling
- Add result display and download
- Integrate with ShipAny credit system
```

### **2. Update Upload API for Images**
```typescript
// File: src/app/api/upload/image/route.ts (new file)
// Support image uploads for photo-to-speech feature
const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];
```

### **3. Update LipSync Create API**
```typescript
// File: src/app/api/lipsync/create/route.ts
// Changes needed:
- Support both image and video inputs
- Fixed 5 credits pricing
- Better error messages
```

### **4. Create Status API**
```typescript
// File: src/app/api/lipsync/status/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return project status, progress, and result URL
}
```

## 📱 **User Flow Implementation**

### **Complete User Journey**
```
1. User visits homepage
2. Sees LipSync Editor below hero section
3. Chooses Photo or Video mode
4. Uploads file via drag & drop
5. Enters text to speak
6. Clicks Generate (5 credits deducted)
7. Sees real-time progress
8. Gets download link when complete
9. Can view project in My Projects page
```

### **Error Handling**
```typescript
const errorHandling = {
  insufficientCredits: "Redirect to pricing page",
  uploadFailed: "Show retry option",
  generationFailed: "Refund credits, show error",
  networkError: "Show offline message"
};
```

## 🎨 **UI/UX Improvements**

### **1. Real-time Feedback**
- Show actual credit balance
- Display upload progress
- Show generation progress with ETA
- Preview uploaded content

### **2. Result Display**
```typescript
// Add result section to editor
const ResultSection = ({ resultUrl, projectId }) => (
  <div className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded-lg">
    <h3 className="text-lg font-semibold text-green-400 mb-2">
      🎉 Video Generated Successfully!
    </h3>
    <div className="flex gap-3">
      <Button asChild>
        <a href={resultUrl} download>Download Video</a>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/my-projects">View All Projects</Link>
      </Button>
    </div>
  </div>
);
```

### **3. Mobile Optimization**
```css
/* Responsive design for mobile */
@media (max-width: 768px) {
  .lipsync-editor {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 600px;
  }
  
  .preview-panel {
    height: 200px;
  }
}
```

## 🚀 **Implementation Priority**

### **High Priority (Week 1)**
1. ✅ Editor UI integration (completed)
2. 🔄 API integration with existing endpoints
3. 🔄 Real credit system integration
4. 🔄 File upload functionality

### **Medium Priority (Week 2)**
1. Status polling and progress display
2. Result download and sharing
3. Error handling and user feedback
4. Mobile responsiveness

### **Low Priority (Week 3)**
1. Advanced features (voice selection, subtitles)
2. Batch processing
3. Project templates
4. Analytics integration

## 📊 **Success Metrics**

### **Technical Metrics**
- Upload success rate > 95%
- Generation success rate > 90%
- Average generation time < 3 minutes
- API response time < 2 seconds

### **Business Metrics**
- User engagement with editor > 60%
- Conversion from trial to paid > 15%
- Credit consumption per user > 10/month
- User retention after first generation > 40%

**Next Steps: Implement API integration and real credit system integration.**
