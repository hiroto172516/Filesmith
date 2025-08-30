import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for upgrading to FileSmith Pro! Your subscription is now active and you can enjoy all the premium features.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">FileSmith Pro</span>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 2,000 generations per day</li>
            <li>• Max 5GB per file</li>
            <li>• All file formats</li>
            <li>• API access</li>
            <li>• Priority support</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Start Generating Files
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Redirecting automatically in 10 seconds...
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;