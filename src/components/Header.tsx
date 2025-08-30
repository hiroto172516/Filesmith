import React from 'react';
import { User, LogOut, Crown, CreditCard, Zap } from 'lucide-react';
import type { UserProfile } from '../hooks/useAuth';

interface HeaderProps {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  dailyUsage: number;
  dailyLimit: number;
  onSignIn: () => void;
  onSignOut: () => void;
  onUpgrade: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  profile, 
  loading, 
  dailyUsage,
  dailyLimit,
  onSignIn, 
  onSignOut, 
  onUpgrade 
}) => {
  const isAuthenticated = !!user;
  const plan = profile?.plan || 'free';
  
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'from-blue-50 to-indigo-50 text-blue-800';
      case 'team': return 'from-purple-50 to-pink-50 text-purple-800';
      default: return 'from-amber-50 to-orange-50 text-amber-800';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Pro Plan';
      case 'team': return 'Team Plan';
      default: return 'Free Plan';
    }
  };

  const getUsageDisplay = () => {
    if (!isAuthenticated) {
      return `${dailyUsage}/10 (Guest)`;
    }
    return dailyLimit === Infinity ? `${dailyUsage}/∞` : `${dailyUsage}/${dailyLimit}`;
  };

  const getUsageColor = () => {
    if (!isAuthenticated) return 'text-gray-600';
    if (dailyLimit === Infinity) return 'text-green-600';
    
    const percentage = dailyUsage / dailyLimit;
    if (percentage >= 0.9) return 'text-red-600';
    if (percentage >= 0.7) return 'text-amber-600';
    return 'text-blue-600';
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FileSmith</h1>
            <p className="text-xs text-gray-500">Test File Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Usage Counter */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Daily usage:</span>
              <span className={`font-semibold ${getUsageColor()}`}>
                {getUsageDisplay()}
              </span>
            </div>
            {isAuthenticated && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className={`flex items-center gap-2 bg-gradient-to-r ${getPlanColor(plan)} px-3 py-1 rounded-lg text-xs`}>
                  <Crown className="w-3 h-3" />
                  <span className="font-medium">{getPlanLabel(plan)}</span>
                </div>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {plan === 'free' && (
                <button
                  onClick={onUpgrade}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <CreditCard className="w-4 h-4" />
                  Upgrade
                </button>
              )}
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <button
                  onClick={onSignOut}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;