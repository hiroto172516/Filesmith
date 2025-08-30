import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Settings } from 'lucide-react';
import type { FileFormat } from './FileGenerator';

interface GenerationFormProps {
  format: FileFormat;
  onGenerate: (parameters: Record<string, any>) => void;
  isGenerating: boolean;
  disabled?: boolean;
  maxFileSize: number;
}

const GenerationForm: React.FC<GenerationFormProps> = ({
  format,
  onGenerate,
  isGenerating,
  disabled = false,
  maxFileSize,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({
    size: 1,
    sizeUnit: 'MB',
    seed: Math.floor(Math.random() * 1000000),
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
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

  const requestedSize = convertToBytes(parameters.size || 1, parameters.sizeUnit || 'KB');
  const exceedsLimit = requestedSize > maxFileSize;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || exceedsLimit) return;
    onGenerate(parameters);
  };

  const updateParameter = (key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const renderFormatSpecificFields = () => {
    switch (format) {
      case 'csv':
      case 'json':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rows
                </label>
                <input
                  type="number"
                  value={parameters.rows || 1000}
                  onChange={(e) => updateParameter('rows', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Columns
                </label>
                <input
                  type="number"
                  value={parameters.columns || 5}
                  onChange={(e) => updateParameter('columns', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </>
        );
      
      case 'png':
      case 'jpeg':
      case 'gif':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  value={parameters.width || 800}
                  onChange={(e) => updateParameter('width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="4096"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  value={parameters.height || 600}
                  onChange={(e) => updateParameter('height', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="4096"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={parameters.backgroundColor || '#3B82F6'}
                    onChange={(e) => updateParameter('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={parameters.backgroundColor || '#3B82F6'}
                    onChange={(e) => updateParameter('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern
                </label>
                <select
                  value={parameters.pattern || 'solid'}
                  onChange={(e) => updateParameter('pattern', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="solid">Solid Color</option>
                  <option value="gradient">Gradient</option>
                  <option value="grid">Grid Pattern</option>
                  <option value="noise">Random Noise</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'mp4':
      case 'webm':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={parameters.duration || 30}
                  onChange={(e) => updateParameter('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="3600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  value={parameters.width || 1920}
                  onChange={(e) => updateParameter('width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="4096"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  value={parameters.height || 1080}
                  onChange={(e) => updateParameter('height', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="4096"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={parameters.backgroundColor || '#3B82F6'}
                    onChange={(e) => updateParameter('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={parameters.backgroundColor || '#3B82F6'}
                    onChange={(e) => updateParameter('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Pattern
                </label>
                <select
                  value={parameters.videoPattern || 'solid'}
                  onChange={(e) => updateParameter('videoPattern', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="solid">Solid Color</option>
                  <option value="colorBars">Color Bars</option>
                  <option value="testPattern">Test Pattern</option>
                  <option value="gradient">Moving Gradient</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'pdf':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Pages
                </label>
                <input
                  type="number"
                  value={parameters.pages || 10}
                  onChange={(e) => updateParameter('pages', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={parameters.contentType || 'text'}
                  onChange={(e) => updateParameter('contentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Text Only</option>
                  <option value="mixed">Text + Images</option>
                  <option value="forms">Forms</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'zip':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Files
                </label>
                <input
                  type="number"
                  value={parameters.fileCount || 10}
                  onChange={(e) => updateParameter('fileCount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compression Level
                </label>
                <select
                  value={parameters.compression || 'standard'}
                  onChange={(e) => updateParameter('compression', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">No Compression</option>
                  <option value="fast">Fast</option>
                  <option value="standard">Standard</option>
                  <option value="maximum">Maximum</option>
                </select>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Size Configuration */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          File Configuration
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Size
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={parameters.size}
                onChange={(e) => updateParameter('size', parseFloat(e.target.value))}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  exceedsLimit ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                min="0.001"
                max="5000"
                step="0.001"
              />
              <select
                value={parameters.sizeUnit}
                onChange={(e) => updateParameter('sizeUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="B">Bytes</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
              </select>
            </div>
            {exceedsLimit && (
              <p className="text-red-600 text-sm mt-1">
                Exceeds maximum file size limit ({formatFileSize(maxFileSize)})
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Random Seed
            </label>
            <input
              type="number"
              value={parameters.seed}
              onChange={(e) => updateParameter('seed', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Format-specific fields */}
      {renderFormatSpecificFields() && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            {format.toUpperCase()} Options
          </h4>
          {renderFormatSpecificFields()}
        </div>
      )}

      {/* Advanced Settings */}
      <div className="border-t pt-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Settings
        </button>
        
        {showAdvanced && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={parameters.includeMetadata || false}
                    onChange={(e) => updateParameter('includeMetadata', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include metadata</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={parameters.corruptFile || false}
                    onChange={(e) => updateParameter('corruptFile', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Intentionally corrupt file</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isGenerating || disabled || exceedsLimit}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Zap className="w-5 h-5" />
          {isGenerating ? 'Generating...' : disabled ? 'Limit Reached' : exceedsLimit ? 'File Too Large' : 'Generate File'}
        </button>
      </div>
    </form>
  );
};

export default GenerationForm;