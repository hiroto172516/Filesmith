import React from 'react';
import { FileText, Image, Video, Music, Archive, Database } from 'lucide-react';
import type { FileFormat } from './FileGenerator';

interface FileFormatSelectorProps {
  selectedFormat: FileFormat;
  onFormatChange: (format: FileFormat) => void;
}

const formatCategories = {
  Documents: [
    { format: 'txt' as FileFormat, label: 'Text', icon: FileText, description: 'Plain text files with custom content' },
    { format: 'pdf' as FileFormat, label: 'PDF', icon: FileText, description: 'PDF documents with pages and metadata' },
  ],
  Images: [
    { format: 'png' as FileFormat, label: 'PNG', icon: Image, description: 'PNG images with transparency support' },
    { format: 'jpeg' as FileFormat, label: 'JPEG', icon: Image, description: 'JPEG images with compression options' },
    { format: 'gif' as FileFormat, label: 'GIF', icon: Image, description: 'GIF images including animated support' },
  ],
  Media: [
    { format: 'mp4' as FileFormat, label: 'MP4', icon: Video, description: 'MP4 videos with custom duration' },
  ],
  Data: [
    { format: 'csv' as FileFormat, label: 'CSV', icon: Database, description: 'CSV files with custom schemas' },
    { format: 'json' as FileFormat, label: 'JSON', icon: Database, description: 'JSON data with nested structures' },
  ],
  Archives: [
    { format: 'zip' as FileFormat, label: 'ZIP', icon: Archive, description: 'ZIP archives with multiple files' },
  ],
};

const FileFormatSelector: React.FC<FileFormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select File Format</h3>
        
        {Object.entries(formatCategories).map(([category, formats]) => (
          <div key={category} className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formats.map(({ format, label, icon: Icon, description }) => (
                <button
                  key={format}
                  onClick={() => onFormatChange(format)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                    selectedFormat === format
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedFormat === format
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`font-semibold ${
                        selectedFormat === format ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {label}
                      </h5>
                      <p className={`text-sm mt-1 ${
                        selectedFormat === format ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileFormatSelector;