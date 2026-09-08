export const PLANS = {
  pro: {
    name: 'PRO ACCESS',
    tier: 'pro',
    duration: '6 months',
    billingCycle: '6 Months',
    features: [
        'Unlimited Downloads',
        'Pixel-Perfect AI Generation',
        'Premium AI (Antigravity + Claude + Advance)',
        'One-Click ZIP Export',
        'Premium UI & Animation Library',
        'Advanced 3D Components',
        '100+ Premium Templates'
    ],
  },
  custom: {
    name: 'CUSTOM ACCESS',
    tier: 'custom',
    duration: 'flexible',
    billingCycle: 'Custom',
    features: [
        'Selected Component Categories Only',
        'Premium AI Access',
        'Full Source Code Downloads',
        'Unlimited Storage',
        '24/7 Customer Support',
        'Early Access to New Components',
    ],
  },
};

export const CATEGORY_PRICES = {
  // Tier 1 - Basic
  button: { name: 'Buttons', usd: 0.99, inr: 19, tier: 1 },
  text: { name: 'Text Animations', usd: 0.99, inr: 19, tier: 1 },
  // Tier 2 - Standard
  cursor: { name: 'Cursor Effects', usd: 1.99, inr: 39, tier: 2 },
  'image-interaction': { name: 'Image/Carousel', usd: 1.99, inr: 39, tier: 2 },
  miscellaneous: { name: 'Miscellaneous', usd: 1.99, inr: 39, tier: 2 },
  // Tier 3 - Premium
  'interactive-background': { name: 'Interactive Backgrounds', usd: 2.99, inr: 59, tier: 3 },
  '3d': { name: '3D Components', usd: 2.99, inr: 59, tier: 3 },
};

export const DURATION_DISCOUNTS = {
  '1month': { months: 1, discount: 0 },
  '6months': { months: 6, discount: 0.15 },
  '1year': { months: 12, discount: 0.25 },
};
