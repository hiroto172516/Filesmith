import React, { useState } from 'react';
import { X, Check, Crown, Loader } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'pro' | 'team';
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpgrade = async (priceId: string) => {
    setLoading(true);
    setError('');
    
    try {
      await createCheckoutSession(priceId, 'subscription');
    } catch (error: any) {
      console.error('Error upgrading plan:', error);
      setError(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '¥0',
      period: 'forever',
      current: currentPlan === 'free',
      features: [
        '10 generations per day (guest)',
        '50 generations per day (signed in)',
        'Max 100MB per file',
        'Basic file formats',
        'No history (guest)',
        'History saved (signed in)',
        'Up to 3 presets (signed in)',
        'Community support',
      ],
      limitations: [
        'Ads displayed',
        'No API access',
      ],
      buttonText: 'Current Plan',
      buttonDisabled: true,
    },
    {
      name: 'FileSmith Pro',
      price: '¥1,500',
      period: 'per month',
      current: currentPlan === 'pro',
      popular: true,
      features: STRIPE_PRODUCTS.filesmith_pro.features,
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      buttonDisabled: currentPlan === 'pro',
      onUpgrade: () => handleUpgrade(STRIPE_PRODUCTS.filesmith_pro.priceId),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">Upgrade to unlock more powerful file generation capabilities</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-50'
                    : plan.current
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    {plan.name === 'FileSmith Pro' && <Crown className="w-6 h-6 text-blue-600 mr-2" />}
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.onUpgrade}
                  disabled={plan.buttonDisabled || loading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.current
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl disabled:opacity-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              All plans include secure file generation, hash verification, and basic support.
              <br />
              Need custom limits or enterprise features? <a href="mailto:sales@filesmith.dev" className="text-blue-600 hover:underline">Contact our sales team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;