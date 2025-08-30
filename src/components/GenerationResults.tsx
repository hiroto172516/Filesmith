import React from 'react';
import { Download, Hash, FileText, Clock, CheckCircle, Loader } from 'lucide-react';
import type { GenerationJob } from './FileGenerator';
import StorageInfo from './StorageInfo';

interface GenerationResultsProps {
  job: GenerationJob;
  userPlan?: 'free' | 'pro' | 'team';
}

const GenerationResults: React.FC<GenerationResultsProps> = ({ job, userPlan = 'free' }) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {job.status === 'generating' && (
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          )}
          {job.status === 'completed' && (
            <CheckCircle className="w-6 h-6 text-green-600" />
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {job.status === 'generating' ? 'Generating File...' : 'File Generated Successfully'}
            </h3>
            <p className="text-gray-600">
              {job.format.toUpperCase()} file • Job #{job.id}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Bar */}
        {job.status === 'generating' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Math.round(job.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* File Details */}
        {job.status === 'completed' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">File Size</p>
                  <p className="text-lg font-bold text-gray-700">
                    {job.fileSize ? formatFileSize(job.fileSize) : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Hash className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Hash</p>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {job.hash || 'Computing...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-600">
                    {job.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Parameters Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Generation Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {Object.entries(job.parameters).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Information */}
            <StorageInfo job={job} userPlan={userPlan} />

            {/* Download Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (job.fileUrl) {
                    // Prevent default navigation
                    const downloadFile = async () => {
                      try {
                        const response = await fetch(job.fileUrl!);
                        const blob = await response.blob();
                        
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `filesmith_${job.format}_${job.id}.${job.format}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(link.href);
                      } catch (error) {
                        console.error('Download failed:', error);
                        alert('Download failed. Please try again.');
                      }
                    };
                    
                    downloadFile();
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download className="w-5 h-5" />
                Download File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationResults;