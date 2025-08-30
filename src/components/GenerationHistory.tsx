import React from 'react';
import { Download, RotateCcw, Trash2, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

export interface GenerationJob {
  id: string;
  format: string;
  params: any;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress?: number;
  createdAt: Date;
  completedAt?: Date;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
}

interface GenerationHistoryProps {
  jobs: GenerationJob[];
  onDownload: (job: GenerationJob) => void;
  onRetry: (job: GenerationJob) => void;
  onDelete: (jobId: string) => void;
}

export default function GenerationHistory({ jobs, onDownload, onRetry, onDelete }: GenerationHistoryProps) {
  const getStatusIcon = (status: GenerationJob['status']) => {
    switch (status) {
      case 'pending':
      case 'generating':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Generation History</h3>
        <p className="text-gray-500">Start generating files to see your history here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Generation History</h2>
        <p className="text-sm text-gray-500 mt-1">{jobs.length} total generations</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {jobs.map((job) => (
          <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(job.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 uppercase">
                      {job.format}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatFileSize(job.fileSize)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {job.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {job.status === 'completed' && (
                  <button
                    onClick={() => onDownload(job)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </button>
                )}
                
                {job.status === 'failed' && (
                  <button
                    onClick={() => onRetry(job)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retry
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(job.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
            
            {job.status === 'generating' && job.progress !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Generating...</span>
                  <span>{Math.round(job.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {job.status === 'failed' && job.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{job.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}