import React, { useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import FileFormatSelector from './FileFormatSelector';
import GenerationForm from './GenerationForm';
import GenerationResults from './GenerationResults';
import { useAuth } from '../hooks/useAuth';

export type FileFormat = 'txt' | 'csv' | 'json' | 'png' | 'jpeg' | 'gif' | 'pdf' | 'zip' | 'mp4';

export interface GenerationJob {
  id: string;
  format: FileFormat;
  parameters: Record<string, any>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  fileSize?: number;
  hash?: string;
  createdAt: Date;
  expiresAt?: Date;
}

interface FileGeneratorProps {
  onJobComplete: (job: GenerationJob) => void;
  guestUsage: number;
  onIncrementGuestUsage: () => void;
}

const FileGenerator: React.FC<FileGeneratorProps> = ({ 
  onJobComplete, 
  guestUsage, 
  onIncrementGuestUsage 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('txt');
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null);
  const { user, profile, incrementDailyUsage, canGenerate, getMaxFileSize } = useAuth();

  const handleGenerate = async (parameters: Record<string, any>) => {
    // Check usage limits
    if (!canGenerate()) {
      alert('Daily generation limit reached. Please upgrade to Pro for unlimited generations.');
      return;
    }

    // Check file size limits
    const maxSize = getMaxFileSize();
    const requestedSize = convertToBytes(parameters.size || 1, parameters.sizeUnit || 'KB');
    
    if (requestedSize > maxSize) {
      const maxSizeFormatted = formatFileSize(maxSize);
      alert(`File size too large. Maximum allowed: ${maxSizeFormatted}. Please upgrade to Pro for larger files.`);
      return;
    }

    const job: GenerationJob = {
      id: Math.random().toString(36).substr(2, 9),
      format: selectedFormat,
      parameters,
      status: 'generating',
      progress: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    };

    setCurrentJob(job);

    // Update usage counter
    if (user) {
      await incrementDailyUsage();
    } else {
      onIncrementGuestUsage();
    }

    // Simulate generation process
    const progressInterval = setInterval(() => {
      setCurrentJob(prev => {
        if (!prev || prev.progress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }

        const newProgress = Math.min(prev.progress + Math.random() * 20, 100);
        
        if (newProgress >= 100) {
          const fileContent = generateFileContent(prev.format, prev.parameters);
          const blob = new Blob([fileContent.content], { type: fileContent.mimeType });
          const fileUrl = URL.createObjectURL(blob);
          
          const completedJob = {
            ...prev,
            status: 'completed' as const,
            progress: 100,
            fileUrl: fileUrl,
            fileSize: blob.size,
            hash: 'sha256:' + Math.random().toString(36).substr(2, 32),
          };
          
          if (onJobComplete) {
            onJobComplete(completedJob);
          }
          
          return completedJob;
        }

        return { ...prev, progress: newProgress };
      });
    }, 300);
  };

  const convertToBytes = (size: number, unit: string): number => {
    const units = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    return size * (units[unit as keyof typeof units] || 1);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Content generation functions
  const generateFileContent = (format: FileFormat, params: Record<string, any>) => {
    switch (format) {
      case 'txt':
        return generateTextContent(params);
      case 'csv':
        return generateCSVContent(params);
      case 'json':
        return generateJSONContent(params);
      case 'png':
      case 'jpeg':
      case 'gif':
        return generateImageContent(format, params);
      case 'mp4':
        return generateVideoContent(params);
      case 'pdf':
        return generatePDFContent(params);
      case 'zip':
        return generateZipContent(params);
      default:
        return generateTextContent(params);
    }
  };

  const generateTextContent = (params: Record<string, any>) => {
    const targetSize = convertToBytes(params.size || 1, params.sizeUnit || 'KB');
    const testText = 'TEST ';
    const content = testText.repeat(Math.ceil(targetSize / testText.length)).substring(0, targetSize);
    
    return {
      content,
      mimeType: 'text/plain'
    };
  };

  const generateCSVContent = (params: Record<string, any>) => {
    const rows = params.rows || 1000;
    const columns = params.columns || 5;
    
    let content = '';
    
    // Header
    const headers = Array.from({ length: columns }, (_, i) => `Column${i + 1}`);
    content += headers.join(',') + '\n';
    
    // Data rows
    for (let i = 0; i < rows; i++) {
      const row = Array.from({ length: columns }, (_, j) => `TEST${i + 1}_${j + 1}`);
      content += row.join(',') + '\n';
    }
    
    return {
      content,
      mimeType: 'text/csv'
    };
  };

  const generateJSONContent = (params: Record<string, any>) => {
    const rows = params.rows || 1000;
    
    const data = Array.from({ length: rows }, (_, i) => ({
      id: i + 1,
      name: `TEST_USER_${i + 1}`,
      email: `test${i + 1}@example.com`,
      value: `TEST_VALUE_${i + 1}`,
      timestamp: new Date().toISOString()
    }));
    
    return {
      content: JSON.stringify(data, null, 2),
      mimeType: 'application/json'
    };
  };

  const generateImageContent = (format: FileFormat, params: Record<string, any>) => {
    const width = params.width || 800;
    const height = params.height || 600;
    const backgroundColor = params.backgroundColor || '#3B82F6';
    const pattern = params.pattern || 'solid';
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    if (pattern === 'grid') {
      ctx.strokeStyle = '#ffffff40';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    
    ctx.fillStyle = '#ffffff80';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TEST IMAGE', width / 2, height / 2);
    ctx.font = '16px Arial';
    ctx.fillText(`${width}x${height} ${format.toUpperCase()}`, width / 2, height / 2 + 30);
    
    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/gif';
    const dataUrl = canvas.toDataURL(mimeType);
    
    const base64Data = dataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return {
      content: bytes,
      mimeType
    };
  };

  const generateVideoContent = (params: Record<string, any>) => {
    const duration = params.duration || 30;
    const width = params.width || 1920;
    const height = params.height || 1080;
    const backgroundColor = params.backgroundColor || '#3B82F6';
    
    const content = `# Test Video File
Duration: ${duration} seconds
Resolution: ${width}x${height}
Background Color: ${backgroundColor}
Pattern: ${params.videoPattern || 'solid'}

This is a simulated MP4 file for testing purposes.
TEST_VIDEO_CONTENT_${Date.now()}`;
    
    return {
      content,
      mimeType: 'video/mp4'
    };
  };

  const generatePDFContent = (params: Record<string, any>) => {
    const pages = params.pages || 10;
    
    const content = `%PDF-1.4
# Test PDF File
Pages: ${pages}
Content Type: ${params.contentType || 'text'}

This is a simulated PDF file for testing purposes.
TEST_PDF_CONTENT_${Date.now()}

${Array.from({ length: pages }, (_, i) => `Page ${i + 1} content: TEST_PAGE_${i + 1}`).join('\n\n')}`;
    
    return {
      content,
      mimeType: 'application/pdf'
    };
  };

  const generateZipContent = (params: Record<string, any>) => {
    const fileCount = params.fileCount || 10;
    
    const content = `# Test ZIP Archive
File Count: ${fileCount}
Compression: ${params.compression || 'standard'}

This is a simulated ZIP file for testing purposes.
TEST_ZIP_CONTENT_${Date.now()}

${Array.from({ length: fileCount }, (_, i) => `File ${i + 1}: test_file_${i + 1}.txt`).join('\n')}`;
    
    return {
      content,
      mimeType: 'application/zip'
    };
  };

  const maxFileSize = getMaxFileSize();
  const canGenerateMore = canGenerate();

  return (
    <div className="space-y-8">
      {/* Usage Warning */}
      {!canGenerateMore && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-amber-800 font-medium">Daily limit reached</p>
            <p className="text-amber-700 text-sm">
              {user ? 'Upgrade to Pro for unlimited generations' : 'Sign in for higher limits, or upgrade to Pro for unlimited'}
            </p>
          </div>
          {user && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openPricing'))}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Upgrade Now
            </button>
          )}
        </div>
      )}

      {/* File Size Limit Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <span className="text-blue-800 font-medium">Current Limits</span>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>Maximum file size: <span className="font-semibold">{formatFileSize(maxFileSize)}</span></p>
          <p>Daily generations: <span className="font-semibold">{user ? (profile?.plan === 'free' ? '50' : '∞') : '10 (Guest)'}</span></p>
          {!user && (
            <p className="text-blue-600">Sign in to increase your daily limit to 50 generations</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Files</h2>
          <p className="text-gray-600">Create test files with custom specifications and formats</p>
        </div>

        <div className="p-6 space-y-8">
          <FileFormatSelector
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
          />

          <GenerationForm
            format={selectedFormat}
            onGenerate={handleGenerate}
            isGenerating={currentJob?.status === 'generating'}
            disabled={!canGenerateMore}
            maxFileSize={maxFileSize}
          />
        </div>
      </div>

      {currentJob && (
        <GenerationResults 
          job={currentJob} 
          userPlan={profile?.plan || 'free'} 
        />
      )}
    </div>
  );
};

export default FileGenerator;