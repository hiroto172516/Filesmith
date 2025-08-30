import React, { useState, useEffect } from 'react';
import { Cpu, Clock, Settings, FileText, Image, Video, Database, Lock, User } from 'lucide-react';
import Header from './components/Header';
import FileGenerator from './components/FileGenerator';
import { PresetGallery } from './components/PresetGallery';
import GenerationHistory from './components/GenerationHistory';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import SuccessPage from './components/SuccessPage';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import type { GenerationJob } from './components/FileGenerator';
import type { Preset } from './hooks/usePresets';

const App: React.FC = () => {
  const { user, profile, loading, signOut, isAuthenticated, getDailyLimit } = useAuth();
  const { subscription, plan } = useSubscription(user?.id);
  
  const [activeTab, setActiveTab] = useState<'generate' | 'presets' | 'history'>('generate');
  const [generationHistory, setGenerationHistory] = useState<GenerationJob[]>([]);
  const [guestUsage, setGuestUsage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'success'>('main');
  
  // Listen for custom events
  useEffect(() => {
    const handleOpenAuth = () => setShowAuthModal(true);
    const handleOpenPricing = () => setShowPricingModal(true);
    
    window.addEventListener('openAuth', handleOpenAuth);
    window.addEventListener('openPricing', handleOpenPricing);
    
    return () => {
      window.removeEventListener('openAuth', handleOpenAuth);
      window.removeEventListener('openPricing', handleOpenPricing);
    };
  }, []);

  // Check URL for success page
  useEffect(() => {
    if (window.location.pathname === '/success') {
      setCurrentPage('success');
    }
  }, []);

  const getCurrentUsage = () => {
    if (user && profile) {
      return profile.daily_usage || 0;
    }
    return guestUsage;
  };

  const getCurrentLimit = () => {
    if (user) {
      return getDailyLimit();
    }
    return 10; // Guest limit
  };

  const handleJobComplete = (job: GenerationJob) => {
    // Only save to history if user is logged in
    if (user) {
      setGenerationHistory(prev => [job, ...prev]);
    }
  };

  const handleDownload = async (job: GenerationJob) => {
    if (!job || !job.fileUrl) return;

    try {
      const response = await fetch(job.fileUrl);
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

  const handleRetry = (job: GenerationJob) => {
    if (!job) return;
    
    setGenerationHistory(prev => prev.filter(j => j.id !== job.id));
    setActiveTab('generate');
  };

  const handleDelete = (jobId: string) => {
    if (confirm('Are you sure you want to delete this generation job?')) {
      setGenerationHistory(prev => {
        const job = prev.find(j => j.id === jobId);
        if (job?.fileUrl) {
          URL.revokeObjectURL(job.fileUrl);
        }
        return prev.filter(j => j.id !== jobId);
      });
    }
  };

  const handleUsePreset = (preset: Preset) => {
    setActiveTab('generate');
    // The FileGenerator will handle applying the preset parameters
  };

  const handleCreatePreset = () => {
    setActiveTab('generate');
    console.log('Create new preset');
  };

  if (currentPage === 'success') {
    return <SuccessPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-gray-600">Loading FileSmith...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-2">{(useAuth() as any).debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header 
        user={user}
        profile={profile}
        loading={loading}
        dailyUsage={getCurrentUsage()}
        dailyLimit={getCurrentLimit()}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={signOut}
        onUpgrade={() => setShowPricingModal(true)}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section for new users */}
        {!isAuthenticated && activeTab === 'generate' && (
          <div className="text-center py-12 mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FileSmith
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Generate test files instantly. Create dummy data for development, testing, and validation with precision and speed.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Documents</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Image className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Images</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Videos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Database className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Data</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
              <p className="text-blue-800 text-sm">
                <strong>Try it now:</strong> Generate up to 10 files as a guest, or sign in for 50 daily generations and preset saving!
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'generate'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Cpu className="w-5 h-5" />
            Generate Files
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'presets'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            Presets
            {!user && <Lock className="w-4 h-4 ml-1" />}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Clock className="w-5 h-5" />
            History
            {!user && <Lock className="w-4 h-4 ml-1" />}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'generate' && (
          <FileGenerator 
            onJobComplete={handleJobComplete}
            guestUsage={guestUsage}
            onIncrementGuestUsage={() => setGuestUsage(prev => prev + 1)}
          />
        )}
        {activeTab === 'presets' && (
          <PresetGallery 
            user={user}
            userPlan={plan}
            onUsePreset={handleUsePreset}
          />
        )}
        {activeTab === 'history' && (
          user ? (
            <GenerationHistory 
              jobs={generationHistory}
              onDownload={handleDownload}
              onRetry={handleRetry}
              onDelete={handleDelete}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view history</h3>
              <p className="text-gray-600 mb-4">
                Your generation history will be saved when you create an account
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In to Continue
              </button>
            </div>
          )
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={plan}
      />
    </div>
  );
};

export default App;