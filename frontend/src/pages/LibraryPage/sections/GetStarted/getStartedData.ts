export interface DocBlock {
    heading: string;
    body?: string;
    code?: { label?: string; lang?: string; content: string };
    bullets?: string[];
}

export interface GetStartedDoc {
    id: string;
    title: string;
    icon: string;
    tagline: string;
    blocks: DocBlock[];
}

export const GET_STARTED_PAGES: GetStartedDoc[] = [
    {
        id: 'introduction',
        title: 'Introduction',
        icon: '🚀',
        tagline: 'What is UI HUB — and what it can do for you.',
        blocks: [
            {
                heading: 'What is UI HUB?',
                body: 'UI HUB 2.0 is not just another component library — it is a complete creative development platform for modern web engineers. It is a premium design system, an AI coding assistant, and a component showcase rolled into one. Whether you are building SaaS dashboards, portfolio sites, landing pages, or full-scale applications, UI HUB gives you battle-tested, beautiful, and highly interactive building blocks ready to drop into any React or Vite project.',
            },
            {
                heading: 'Key features at a glance',
                bullets: [
                    '100+ cinematic, interactive UI components',
                    'AI-powered code generation via vibe prompts',
                    '3D experiences, cursor effects and animated backgrounds',
                    'Full theme system (dark / light)',
                    'MCP integration — use UI HUB inside your AI coding tools',
                    'Firebase-powered membership with Free / Pro plans',
                ],
            },
            {
                heading: 'The tech powering it',
                body: 'React 19, TypeScript, Vite 6, Tailwind CSS 4, Three.js, Framer Motion, Firebase Auth & Storage, MongoDB database, Express backend and a Node.js + TypeScript MCP server.',
            },
        ],
    },
    {
        id: 'installation',
        title: 'Installation',
        icon: '📦',
        tagline: 'Get UI HUB running locally in a few commands.',
        blocks: [
            {
                heading: 'Prerequisites',
                bullets: [
                    'Node.js v18 or higher',
                    'npm or yarn',
                    'A Firebase project with Authentication enabled',
                ],
            },
            {
                heading: '1. Clone the repository',
                code: { lang: 'bash', content: 'git clone https://github.com/jainil224/UI-HUB-\ncd UI-HUB-' },
            },
            {
                heading: '2. Install all dependencies',
                body: 'This installs dependencies for the root, frontend and backend in one go.',
                code: { lang: 'bash', content: 'npm run install-all' },
            },
            {
                heading: '3. Configure environment',
                body: 'Create frontend/.env.local and backend/.env with your Firebase and MongoDB credentials. Copy the keys below and fill in your own values.',
                code: {
                    lang: 'env',
                    label: 'frontend/.env.local',
                    content: 'VITE_FIREBASE_API_KEY=your_firebase_api_key\nVITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=your_project_id\nVITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com\nVITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\nVITE_FIREBASE_APP_ID=your_app_id\nVITE_API_BASE_URL=http://localhost:5000',
                },
            },
            {
                heading: '4. Run the dev servers',
                code: { lang: 'bash', content: 'npm run dev' },
                body: 'Frontend runs on http://localhost:3000, backend on http://localhost:5000 (health check at /api/health).',
            },
        ],
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '⚡',
        tagline: 'Drop your first component into a page.',
        blocks: [
            {
                heading: 'Pick a component',
                body: 'Open the Library and select any component from the sidebar. Each component ships with a live Preview, the full source Code, and an AI "Vibe" tab that turns a plain-English prompt into production-ready variants.',
            },
            {
                heading: 'Copy the code',
                body: 'Open the Code tab and switch between React / TypeScript or HTML / CSS flavours. Hit copy to grab the whole implementation, then paste it into your project.',
            },
            {
                heading: 'Install dependencies',
                body: 'Many components rely on lucide-react (icons) and framer-motion (animation). Install them once and import the component.',
                code: { lang: 'bash', content: 'npm install lucide-react framer-motion' },
            },
            {
                heading: 'Using the theme prop',
                body: 'Reactive components accept a theme prop. Watch the Theme Manager page for a full walkthrough, including dark / light mode via useTheme().',
            },
            {
                heading: 'Generate with AI',
                body: 'On the Vibe tab, describe your goal and let the built-in AI assistants (Claude, Lovable, or the advanced engine) write the code for you — great for sprawling sections like pricing and landing heroes.',
            },
        ],
    },
    {
        id: 'theme-manager',
        title: 'Theme Manager',
        icon: '🎨',
        tagline: 'Dark / light mode and per-component theming made simple.',
        blocks: [
            {
                heading: 'The ThemeContext',
                body: 'UI HUB ships a ThemeContext that switches between light and dark mode and persists your choice to localStorage under the "theme" key.',
                code: {
                    lang: 'tsx',
                    label: 'ThemeContext.tsx',
                    content: 'import { useTheme } from "./context/ThemeContext";\n\nfunction App() {\n  const { theme, toggleTheme } = useTheme();\n  return (\n    <button onClick={toggleTheme}>\n      Switch to {theme === "dark" ? "light" : "dark"}\n    </button>\n  );\n}',
                },
            },
            {
                heading: 'Design tokens',
                bullets: [
                    'Dark: bg-brand-black + white text + brand-green accents',
                    'Light: soft blue background + dark text + blue accents',
                    'Smooth cross-fade via transition-colors duration-300',
                ],
            },
            {
                heading: 'Per-component theme prop',
                body: 'Individual components expose a theme prop so you can override the active theme for just that component without touching the global toggle.',
                code: {
                    lang: 'tsx',
                    content: '<MagneticCursor\n  theme={theme}        // "dark" | "light"\n  radius={120}\n/>',
                },
            },
            {
                heading: 'Wrap with the provider',
                body: 'Make sure your app is wrapped in ThemeProvider so useTheme works anywhere.',
                code: {
                    lang: 'tsx',
                    content: 'import { ThemeProvider } from "./context/ThemeContext";\n\nroot.render(\n  <ThemeProvider>\n    <App />\n  </ThemeProvider>\n);',
                },
            },
        ],
    },
    {
        id: 'mcp',
        title: 'MCP',
        icon: '🤖',
        tagline: 'Connect UI HUB to your AI coding assistant.',
        blocks: [
            {
                heading: 'What is UI HUB MCP?',
                body: 'MCP (Model Context Protocol) makes UI HUB AI-accessible. Through a few MCP tools, Cursor, Claude Code, VS Code/Copilot and other AI clients can discover components, fetch their source code, dependencies and metadata — directly inside your workflow.',
            },
            {
                heading: 'Get an API key',
                body: 'Sign in and open Dashboard → MCP. Create a API key (uh_live_...) — it is shown exactly once, so copy it immediately. Auth uses Authorization: Bearer <YOUR_UI_HUB_API_KEY>.',
            },
            {
                heading: 'Client configuration',
                code: {
                    lang: 'json',
                    label: '.cursor/mcp.json',
                    content: '{\n  "mcpServers": {\n    "ui-hub": {\n      "url": "https://ui-hub-mcp.onrender.com/mcp",\n      "headers": {\n        "Authorization": "Bearer YOUR_UI_HUB_API_KEY"\n      }\n    }\n  }\n}',
                },
            },
            {
                heading: 'Claude Code (CLI)',
                code: { lang: 'bash', content: 'claude mcp add ui-hub --transport http https://ui-hub-mcp.onrender.com/mcp --header "Authorization: Bearer YOUR_UI_HUB_API_KEY"' },
            },
            {
                heading: 'Available tools',
                bullets: [
                    'search_components — find components by name, category, framework, styling, tags',
                    'get_component — full metadata, code, styles, dependencies & install notes',
                    'get_component_code — copy-paste-ready source for a component',
                    'search_templates / get_template — reusable page templates',
                    'search_animations / get_animation_code — animation resources',
                    'list_categories — all available categories',
                    'get_dependencies — required packages for a component',
                ],
            },
            {
                heading: 'Free vs Pro',
                body: 'Free accounts can search free components with a daily request limit. Pro unlocks premium components, templates, animations, full source code and higher usage. Admins get full access. All limits are enforced server-side by the MCP server.',
            },
            {
                heading: 'Manage it all',
                body: 'Head to Dashboard → MCP to create, copy and revoke keys. Admins can monitor live usage in the Admin → MCP section (Overview, Analytics, Logs, Security, API Keys and more).',
            },
        ],
    },
    {
        id: 'why-ui-hub',
        title: 'Why UI HUB?',
        icon: '💡',
        tagline: 'The difference UI HUB makes for developers, designers and teams.',
        blocks: [
            {
                heading: 'For solo developers',
                bullets: [
                    'Skip the boring parts — drop in production-quality components and focus on product logic',
                    'Ship faster — use AI prompts to translate any component into your stack in seconds',
                    'Learn by reading — every component is clean, commented TypeScript covering WebGL, physics and 3D',
                ],
            },
            {
                heading: 'For designers turning developer',
                bullets: [
                    'No blank-page syndrome — start with stunning backgrounds and layouts already done',
                    'A CSS effects library — glassmorphism, neon glow, glitch, scanlines and more to study and reuse',
                    'A full dark / light theme system you can plug into any project',
                ],
            },
            {
                heading: 'For teams & agencies',
                bullets: [
                    'Premium aesthetics out of the box — client deliverables that wow from day one',
                    'A consistent design language built on the brand design token system',
                    'Time-boxed delivery — AI prompts help brief junior devs without lengthy docs',
                    'An MCP server your whole team can share inside Cursor or Claude',
                ],
            },
            {
                heading: 'Practical use cases',
                bullets: [
                    'Add a Black Hole background to a dark landing-page hero',
                    'Replace a boring cursor with an Aurora Cursor on a portfolio',
                    'Use the Galaxy Animation as an app loading screen',
                    'Drop the Neural Network background behind a SaaS pricing section',
                    'Add the Scroll 3D Animation to explain data structures in a blog',
                ],
            },
        ],
    },
];
