export interface TemplateItem {
    id: string;
    title: string;
    description: string;
    category: 'All' | 'SaaS & AI' | 'Agency & Portfolio' | 'E-Commerce' | 'Web3 & FinTech';
    badge?: string;
    framework: string;
    styling: string;
    animation: string;
    isPro: boolean;
    liveDemoUrl?: string;
    githubUrl?: string;
    previewGradient: string;
    accentColor: string;
    stats: {
        pages: number;
        rating: number;
        downloads: string;
    };
    features: string[];
    promptPreview: string;
}

export const templateCategories = [
    'All',
    'SaaS & AI',
    'Agency & Portfolio',
    'E-Commerce',
    'Web3 & FinTech',
] as const;

export type TemplateCategory = (typeof templateCategories)[number];

export const websiteTemplates: TemplateItem[] = [
    {
        id: 'nexus-ai-saas',
        title: 'Nexus AI Platform',
        description: 'Next-generation AI SaaS landing page with dark bento grids, interactive AI chat widget, and dynamic pricing tiers.',
        category: 'SaaS & AI',
        badge: 'TRENDING',
        framework: 'Next.js 15 (App Router)',
        styling: 'Tailwind CSS',
        animation: 'Framer Motion',
        isPro: false,
        liveDemoUrl: 'https://nexus-ai-demo.uihub.dev',
        githubUrl: 'https://github.com/ui-hub/nexus-ai-template',
        previewGradient: 'from-blue-600/30 via-indigo-950 to-black',
        accentColor: '#1F4BFF',
        stats: {
            pages: 6,
            rating: 4.9,
            downloads: '2.4k',
        },
        features: [
            'Interactive AI prompt playground',
            'Dynamic Bento Grid layout',
            'Stripe subscription pricing switch',
            'Full authentication UI flows'
        ],
        promptPreview: `Create a dark modern AI SaaS landing page in Next.js 15 with Tailwind CSS and Framer Motion. Include a glowing hero section with an interactive prompt input, bento grid for AI model benchmarks, client testimonial marquee, and neo-brutalist interactive pricing toggle.`
    },
    {
        id: 'cyber-motion-agency',
        title: 'Vortex Creative Studio',
        description: 'High-octane design agency and creative studio portfolio featuring 3D canvas physics, custom cursor, and magnetic buttons.',
        category: 'Agency & Portfolio',
        badge: 'HOT',
        framework: 'Vite + React 19',
        styling: 'Tailwind CSS',
        animation: 'GSAP + Three.js',
        isPro: true,
        liveDemoUrl: 'https://vortex-studio.uihub.dev',
        githubUrl: 'https://github.com/ui-hub/vortex-studio',
        previewGradient: 'from-amber-500/25 via-neutral-900 to-black',
        accentColor: '#FFC700',
        stats: {
            pages: 8,
            rating: 5.0,
            downloads: '1.8k',
        },
        features: [
            'WebGL fluid distorted text reveal',
            'Magnetic CTA buttons with sound fx',
            'Case study filterable drawer',
            'Smooth inertia scroll with Lenis'
        ],
        promptPreview: `Design an avant-garde digital agency website with Vite, React, and Three.js. Implement dynamic cursor tracking, a marquee showcase of agency awards, dark neo-brutalist borders, and interactive 3D model canvas in the hero background.`
    },
    {
        id: 'solaris-web3-dex',
        title: 'Solaris DeFi Terminal',
        description: 'Ultra-fast cryptocurrency trading terminal and Web3 dashboard with real-time charts, wallet connect modal, and swap widget.',
        category: 'Web3 & FinTech',
        badge: 'NEW',
        framework: 'Next.js 15',
        styling: 'Tailwind CSS',
        animation: 'Framer Motion',
        isPro: true,
        liveDemoUrl: 'https://solaris-defi.uihub.dev',
        githubUrl: 'https://github.com/ui-hub/solaris-dex',
        previewGradient: 'from-emerald-500/25 via-neutral-900 to-black',
        accentColor: '#00E599',
        stats: {
            pages: 5,
            rating: 4.8,
            downloads: '1.2k',
        },
        features: [
            'Interactive Candlestick chart simulation',
            'Token swap widget with slippage settings',
            'Wallet connection multi-provider dialog',
            'Glassmorphic order book visualization'
        ],
        promptPreview: `Build a futuristic Web3 DeFi terminal web application with Next.js and Tailwind CSS. Include a high-contrast trading interface, real-time simulated orderbook, customizable widget bento grid, and glowing neon green transaction confirmation toasts.`
    },
    {
        id: 'aura-minimal-portfolio',
        title: 'Aura Developerfolio',
        description: 'Clean, typography-driven personal portfolio for software engineers, designers, and open-source creators.',
        category: 'Agency & Portfolio',
        badge: 'CLEAN',
        framework: 'Next.js 15',
        styling: 'Tailwind CSS',
        animation: 'CSS Keyframes + Motion',
        isPro: false,
        liveDemoUrl: 'https://aura-portfolio.uihub.dev',
        githubUrl: 'https://github.com/ui-hub/aura-portfolio',
        previewGradient: 'from-purple-600/25 via-neutral-950 to-black',
        accentColor: '#A855F7',
        stats: {
            pages: 4,
            rating: 4.9,
            downloads: '3.6k',
        },
        features: [
            'Markdown blog engine with syntax highlighting',
            'GitHub activity & pins live sync',
            'Interactive project spotlight carousel',
            'Quick cmd+k command palette'
        ],
        promptPreview: `Create an ultra-minimalist developer portfolio website. Emphasize crisp editorial typography, command palette (Cmd+K) navigation, work experience timeline, interactive code snippet showcase, and accessible dark/light modes.`
    },
    {
        id: 'hypebeast-ecommerce',
        title: 'Kicks & Drops Store',
        description: 'Bold streetwear & sneaker release e-commerce template with sticky 3D product showcase and cart slideout.',
        category: 'E-Commerce',
        badge: 'POPULAR',
        framework: 'Next.js 15 + React 19',
        styling: 'Tailwind CSS',
        animation: 'Framer Motion',
        isPro: true,
        liveDemoUrl: 'https://drops-store.uihub.dev',
        githubUrl: 'https://github.com/ui-hub/kicks-drops-ecommerce',
        previewGradient: 'from-red-600/25 via-neutral-900 to-black',
        accentColor: '#FF3B30',
        stats: {
            pages: 7,
            rating: 4.9,
            downloads: '1.9k',
        },
        features: [
            '360-degree interactive product spinner',
            'Live countdown timer for exclusive drops',
            'Dynamic neo-brutalist size selector',
            'Slide-over cart drawer with instant checkout'
        ],
        promptPreview: `Build a bold, neo-brutalist streetwear e-commerce landing and catalog page. Include huge typography, product color switcher, interactive size pills, drop countdown banner, and high-impact hover photo reveals.`
    },
    {
        id: 'devpulse-developer-tools',
        title: 'DevPulse Cloud Console',
        description: 'Developer infrastructure & API docs template with interactive terminal, sandbox playground, and multi-language code tabs.',
        category: 'SaaS & AI',
        badge: 'DEVTOOL',
        framework: 'Vite + React 19',
        styling: 'Tailwind CSS',
        animation: 'Framer Motion',
        isPro: false,
        liveDemoUrl: 'https://devpulse.uihub.dev',
        githubUrl: 'https://github.com/ui-hub/devpulse-docs',
        previewGradient: 'from-cyan-600/25 via-neutral-900 to-black',
        accentColor: '#06B6D4',
        stats: {
            pages: 9,
            rating: 4.8,
            downloads: '2.1k',
        },
        features: [
            'API endpoint tester with curl generator',
            'Multi-language code tabs (TS, Python, Go)',
            'Collapsible nested documentation sidebar',
            'Full-text fuzzy search modal'
        ],
        promptPreview: `Generate a high-tech developer tooling and API documentation landing page. Feature an animated CLI terminal emulator, copyable code blocks with language switching tabs, architecture diagram bento card, and status indicator.`
    }
];
