export const INR_PER_USD = 83;

// One-time lifetime price. USD is the converted equivalent of the INR price.
export const LIFETIME_PRICE = {
  inr: 3999,
  usd: Math.round((3999 / INR_PER_USD) * 100) / 100,
};

export const AI_CREDITS = {
  freeDaily: 5,
  proDaily: 5,
  proMonthly: 50,
  ultimateMonthly: 200,
};

export const CREDIT_PACK = {
  usdPerCredit: 0.1,
  inrPerCredit: 8.3,
  expiryDays: 30,
  minCredits: 50,
  maxCredits: 500,
  step: 50,
};

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
        '100+ Premium Templates',
        '5 Daily + 50 Monthly AI Credits',
    ],
  },
  ultimate: {
    name: 'ULTIMATE ACCESS',
    tier: 'ultimate',
    duration: '1 year',
    billingCycle: '1 Year',
    features: [
        'Everything in Pro',
        'Unlimited Component Copies (Fair Use)',
        'Unlimited Section Copies (Fair Use)',
        'Unlimited Template Copies (Fair Use)',
        '200 AI Credits / Month',
        'Access to All Features',
    ],
  },
  lifetime: {
    name: 'LIFETIME ACCESS',
    tier: 'lifetime',
    duration: 'Lifetime',
    billingCycle: 'One-time',
    features: [
        'Everything in Ultimate',
        'One-time payment, no renewal',
        'Unlimited Component Copies (Fair Use)',
        'Unlimited Section Copies (Fair Use)',
        'Unlimited Template Copies (Fair Use)',
        '200 AI Credits / Month',
        'Access to All Features',
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
  'particles-background': { name: 'Particles Backgrounds', usd: 2.99, inr: 59, tier: 3 },
  '3d': { name: '3D Components', usd: 2.99, inr: 59, tier: 3 },
  'space': { name: 'Space & Planets', usd: 2.99, inr: 59, tier: 3 },
};

export const COMPONENT_PRICE = {
  // Flat price to buy a single premium component outright.
  usd: 1.99,
  inr: 49,
};

export const DURATION_DISCOUNTS = {
  '1month': { months: 1, discount: 0 },
  '6months': { months: 6, discount: 0.15 },
  '1year': { months: 12, discount: 0.25 },
};
