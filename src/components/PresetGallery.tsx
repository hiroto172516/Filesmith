import React, { useState } from 'react';
import { Heart, Settings, Trash2, Plus, Star, Download, Edit3, Lock, User } from 'lucide-react';
import { usePresets } from '../hooks/usePresets';

interface PresetGalleryProps {
  user: any;
  userPlan: string;
  onUsePreset: (preset: any) => void;
}

export function PresetGallery({ user, userPlan, onUsePreset }: PresetGalleryProps) {
  const { presets, loading, createPreset, deletePreset, updatePreset } = usePresets(user?.id);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetParams, setNewPresetParams] = useState({
    format: 'txt' as any,
    width: 1920,
    height: 1080,
    backgroundColor: '#3B82F6',
    pattern: 'solid',
    size: 1,
    sizeUnit: 'MB'
  });

  const maxPresets = userPlan === 'free' ? 3 : 999;
  const canCreateMore = presets.length < maxPresets;

  const handleCreatePreset = async () => {
    if (!newPresetName.trim() || !user) return;

    const preset = {
      name: newPresetName,
      description: `Custom ${newPresetParams.format.toUpperCase()} preset`,
      format: newPresetParams.format,
      parameters: newPresetParams,
      tags: [],
      is_starred: false,
      is_public: false,
    };

    const success = await createPreset(preset as any);
    if (success) {
      setShowCreateForm(false);
      setNewPresetName('');
      setNewPresetParams({
        format: 'txt' as any,
        width: 1920,
        height: 1080,
        backgroundColor: '#3B82F6',
        pattern: 'solid',
        size: 1,
        sizeUnit: 'MB'
      });
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      await deletePreset(presetId);
    }
  };

  const handleUsePreset = (preset: any) => {
    onUsePreset(preset);
  };

  const toggleFavorite = async (preset: any) => {
    await updatePreset(preset.id, {
      is_starred: !preset.is_starred
    });
  };

  // Show login prompt for guests
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Preset Gallery</h2>
            <p className="text-sm text-gray-600 mt-1">
              Sign in to save and manage your presets
            </p>
          </div>
        </div>
        
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to use presets</h3>
          <p className="text-gray-600 mb-4">
            Save your favorite generation settings and reuse them anytime
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAuth'))}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <User className="w-4 h-4" />
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Preset Gallery</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Preset Gallery</h2>
          <p className="text-sm text-gray-600 mt-1">
            {userPlan === 'free' ? (
              <>Using {presets.length} of {maxPresets} presets (Free plan)</>
            ) : (
              <>Unlimited presets (Pro plan)</>
            )}
          </p>
        </div>
        
        {user && canCreateMore && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Preset
          </button>
        )}
        
        {user && !canCreateMore && userPlan === 'free' && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Upgrade to Pro for unlimited presets
          </div>
        )}
      </div>

      {/* Create Preset Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Preset</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preset Name
              </label>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Enter preset name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={newPresetParams.format}
                  onChange={(e) => setNewPresetParams(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="txt">TXT</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="gif">GIF</option>
                  <option value="pdf">PDF</option>
                  <option value="zip">ZIP</option>
                  <option value="mp4">MP4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={newPresetParams.backgroundColor}
                  onChange={(e) => setNewPresetParams(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={newPresetParams.width}
                  onChange={(e) => setNewPresetParams(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={newPresetParams.height}
                  onChange={(e) => setNewPresetParams(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreatePreset}
                disabled={!newPresetName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Preset
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presets Grid */}
      {presets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No presets yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first preset to save time on future generations
          </p>
          {user && canCreateMore && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Preset
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{preset.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{preset.parameters.format?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{preset.parameters.width}×{preset.parameters.height}</span>
                    {preset.usage_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{preset.usage_count} uses</span>
                      </>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => toggleFavorite(preset)}
                  className={`p-1 rounded transition-colors ${
                    preset.is_starred 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${preset.is_starred ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Preview */}
              <div 
                className="w-full h-24 rounded-lg mb-3 border border-gray-200 flex items-center justify-center text-xs text-gray-600"
                style={{ backgroundColor: preset.parameters.backgroundColor || '#3B82F6' }}
              >
                <span className="bg-white/80 px-2 py-1 rounded text-gray-800">
                  {preset.parameters.format?.toUpperCase()} Preview
                </span>
              </div>

              {/* Parameters */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Format:</span>
                  <span className="font-medium">{preset.parameters.format}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">{preset.parameters.width}×{preset.parameters.height}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Pattern:</span>
                  <span className="font-medium">{preset.parameters.pattern || 'solid'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleUsePreset(preset)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Use
                </button>
                
                <button
                  onClick={() => setEditingPreset(preset)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                
                <button
                  onClick={() => handleDeletePreset(preset.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Preset Modal */}
      {editingPreset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Preset</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={editingPreset.name}
                  onChange={(e) => setEditingPreset(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <select
                    value={editingPreset.parameters.format}
                    onChange={(e) => setEditingPreset(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, format: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="txt">TXT</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="gif">GIF</option>
                    <option value="pdf">PDF</option>
                    <option value="zip">ZIP</option>
                    <option value="mp4">MP4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={editingPreset.parameters.backgroundColor}
                    onChange={(e) => setEditingPreset(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, backgroundColor: e.target.value }
                    }))}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={editingPreset.parameters.width}
                    onChange={(e) => setEditingPreset(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, width: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={editingPreset.parameters.height}
                    onChange={(e) => setEditingPreset(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, height: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  await updatePreset(editingPreset.id, editingPreset);
                  setEditingPreset(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingPreset(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}