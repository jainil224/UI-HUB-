export interface DocStep {
    title: string;
    body: string;
    code?: { label?: string; lang?: string; content: string };
}

export interface DocCta {
    intro: string;
    backLabel?: string;
    toIntro?: string;
    browseLabel?: string;
    mcpLabel?: string;
}

export interface DocBlock {
    heading: string;
    body?: string;
    code?: { label?: string; lang?: string; content: string };
    bullets?: string[];
    steps?: DocStep[];
    cta?: DocCta;
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
                body: 'React 19, TypeScript, Vite 6, Tailwind CSS 4, Three.js, Framer Motion, Firebase Auth & Storage, MongoDB database, Express backend and a Node.js + TypeScript MCP server — so it plays perfectly with AI tools like Antigravity, Claude and Lovable.',
            },
            {
                heading: 'Ready to build?',
                body: 'Head into the Library, pick a component, and drop it into your project — or let an AI assistant generate it for you.',
                cta: {
                    intro: 'The fastest way to understand UI HUB is to see it in action.',
                    browseLabel: 'Browse the Library',
                },
            },
        ],
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '⚡',
        tagline: 'The UI HUB workflow — from picking a component to shipping it with AI.',
        blocks: [
            {
                heading: 'How the workflow works',
                body: 'UI HUB is built around a simple three-part loop: find a component, copy its prompt (and code), then let an AI assistant like Antigravity, Claude or Lovable generate or adapt it for you. The steps below walk you through the exact flow.',
            },
            {
                heading: 'The full workflow',
                steps: [
                    {
                        title: 'Pick a component in the Library',
                        body: 'Open the Library sidebar and choose a category — Buttons / hover effects, Text Animations, Backgrounds, Loaders, 3D, Cursor, Scroll and more. Use the search bar to filter by title. Every component opens in the Preview tab first, so you can see exactly how it behaves before you copy anything.',
                    },
                    {
                        title: 'Copy the Vibe prompt (or the raw code)',
                        body: 'Open the Vibe tab and hit copy on the AI prompt — it describes the component in plain English so any AI tool can rebuild or remix it. Prefer to work directly? Open the Code tab and copy the full source (React / TypeScript or HTML / CSS flavours).',
                    },
                    {
                        title: 'Paste prompt + code into your AI tool',
                        body: 'Drop the copied prompt into Antigravity, Claude Code, Claude.ai or Lovable. Include the copied source alongside it and the model produces a production-ready version for your exact stack and design language.',
                        code: {
                            lang: 'text',
                            label: 'Sample AI prompt',
                            content: 'Build a cinematic 3D hero section for my SaaS landing page.\nHere is the UI HUB vibe prompt to follow:\n-------------------------------------------\n<paste the Vibe prompt you copied>\n-------------------------------------------\nAlso use this component source as the visual reference:\n<the copied component code>\nReturn the full component code and list the dependencies.',
                        },
                    },
                    {
                        title: 'Generate it, then copy the result back',
                        body: 'Let the AI generate the variant — a landing hero, a loader, hover effects, whatever you asked for. Copy the generated component code and paste it into your project. The AI handles the scaffolding; you keep full control of the output.',
                    },
                    {
                        title: 'Install dependencies and go',
                        body: 'Many components rely on lucide-react (icons) and framer-motion (animation). Install them once (plus anything the AI lists) and import the component. Use the built-in theme system for dark / light mode.',
                        code: {
                            lang: 'bash',
                            content: 'npm install lucide-react framer-motion\nnpm install <extra-packages-the-ai-listed>',
                        },
                    },
                ],
            },
            {
                heading: 'Using the theme prop',
                body: 'Reactive components accept a theme prop. UI HUB ships a ThemeContext for dark / light mode via useTheme(); set a per-component theme prop to override it locally.',
            },
            {
                heading: 'Or use the built-in Vibe tab',
                body: 'You do not even need an external tool — open the Vibe tab on any component and let the built-in AI assistants (Claude, Lovable, or the advanced engine) rewrite it on the spot. Perfect for quick iterations on sprawling sections like pricing pages and landing heroes.',
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
                heading: 'What is MCP?',
                body: 'MCP (Model Context Protocol) is an open standard that lets AI assistants — like Claude Code, Cursor, VS Code / Copilot and Antigravity — plug into external tools and data in real time. Instead of guessing, a connected AI can fetch live information and code from a server while you work. UI HUB exposes its entire library through MCP, so your AI coding tool becomes a direct window into every UI HUB component.',
            },
            {
                heading: 'The power of UI HUB MCP',
                bullets: [
                    'Discover 100+ components from inside your AI tool — search by name, category, framework, styling or tags',
                    'Fetch full source code, dependencies and install notes instantly, copy-paste ready',
                    'Search reusable templates and animations the same way you search components',
                    'One API key works across Cursor, Claude Code, VS Code / Copilot and Antigravity',
                    'Server-side Pro gating — premium components unlock automatically for paying members',
                ],
            },
            {
                heading: 'How to use it',
                steps: [
                    {
                        title: 'Create an API key',
                        body: 'Sign in, open Dashboard → MCP and create a key (uh_live_...). It is shown exactly once, so copy it immediately. Auth uses Authorization: Bearer <YOUR_UI_HUB_API_KEY>.',
                    },
                    {
                        title: 'Add the server config',
                        body: 'Point your client at the UI HUB MCP endpoint. For Cursor, add this to .cursor/mcp.json:',
                        code: {
                            lang: 'json',
                            label: '.cursor/mcp.json',
                            content: '{\n  "mcpServers": {\n    "ui-hub": {\n      "url": "https://ui-hub-mcp.onrender.com/mcp",\n      "headers": {\n        "Authorization": "Bearer YOUR_UI_HUB_API_KEY"\n      }\n    }\n  }\n}',
                        },
                    },
                    {
                        title: 'Connect Claude Code (CLI)',
                        body: 'For Claude Code, register the server on the command line:',
                        code: {
                            lang: 'bash',
                            content: 'claude mcp add ui-hub --transport http https://ui-hub-mcp.onrender.com/mcp --header "Authorization: Bearer YOUR_UI_HUB_API_KEY"',
                        },
                    },
                    {
                        title: 'Ask your assistant',
                        body: 'That is it — just ask. The AI wires up the tools automatically:',
                        code: {
                            lang: 'text',
                            label: 'Example instruction',
                            content: '"Search for a 3D hero component, fetch its full code and dependencies, then generate a dark-mode variant for my landing page."',
                        },
                    },
                ],
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
            {
                heading: 'Start connecting',
                cta: {
                    intro: 'Create your API key and connect your first AI client in under a minute.',
                    mcpLabel: 'Open MCP Dashboard',
                },
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
            {
                heading: 'Start building',
                body: 'Whatever your role, UI HUB removes the boring 80% so you can focus on the 20% that makes your site memorable.',
                cta: {
                    intro: 'Pick a component and see the difference.',
                    browseLabel: 'Browse the Library',
                },
            },
        ],
    },
];
