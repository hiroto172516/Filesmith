export const STRIPE_PRODUCTS = {
  filesmith_pro: {
    id: 'prod_SxjPBVXt5OpL5r',
    priceId: 'price_1S1nwZGpfQmRXU63C31m4AhF',
    name: 'FileSmith Pro',
    description: 'Advanced file generation with unlimited features',
    price: '¥1,500',
    mode: 'subscription' as const,
    features: [
      'Unlimited generations per day',
      'Max 5GB per file',
      'All file formats',
      'Unlimited history',
      'API access',
      'Unlimited presets',
      'Priority queue',
      'No ads',
      'Email support',
    ],
  },
} as const;

export type StripeProduct = typeof STRIPE_PRODUCTS[keyof typeof STRIPE_PRODUCTS];