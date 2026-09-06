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
    table?: { headers: string[]; rows: string[][] };
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
                heading: 'Why we built UI HUB',
                body: 'Every great landing page, portfolio or SaaS dashboard needs the same set of expensive-to-build pieces — cinematic 3D scenes, hover choreography, animated backgrounds, scroll stories. We kept rewriting them from scratch, and worse, the libraries that existed were static, the paid kits were generic, and AI assistants had almost nothing worth referencing to generate anything beyond a basic card. UI HUB is our answer: one living library where every component is production-grade, animated by default, fully documented, and shipped with an AI-readable prompt — so that both humans and AI agents can rebuild or remix it in seconds.',
            },
            {
                heading: 'The problems UI HUB solves',
                bullets: [
                    'Blank-page syndrome — start from a proven, animated component instead of an empty file',
                    'Copy-paste plumbing — dependencies, props and gotchas are documented before you ever import a file',
                    'AI hallucination — every prompt is grounded in a concrete reference implementation with exact timing, easing and a dependency list, so the AI has something true to work from',
                    'Inconsistent design language — one token system powers dark / light theming across every component',
                    'Wasted hours on animation math — WebGL, physics and easing curves are done, tuned and legible',
                    'Discovery dead-ends — search by name, category, framework, styling or tags, on the site and inside your AI tool via MCP',
                ],
            },
            {
                heading: 'UI HUB vs other platforms',
                body: 'There are plenty of component libraries, but most solve only part of the problem. Here is how UI HUB stacks up against the usual go-tos.',
                code: {
                    lang: 'text',
                    label: 'UI HUB vs the field',
                    content: 'Platform       Style               Animations      AI workflow\nshadcn/ui      utility + copy      minimal         none\nAceternity UI  effect gallery      good (CSS)      no prompts / no MCP\nMagic UI       snippets + effects  good            no prompts / no MCP\nTailwind UI    paid static blocks  none            none\nMUI / Chakra   app design system   shallow         none\nUI HUB         100+ animated 3D    cinematic       vibe prompts + MCP + Vibe tab',
                },
                bullets: [
                    'shadcn/ui — solid utility primitives, but nothing cinematic and no way for an AI to reconstruct a 3D scene',
                    'Aceternity / Magic UI — beautiful effect galleries, mostly CSS-driven, with static snippets rather than a structured prompt',
                    'Tailwind UI — paid, static building blocks; no interactive or 3D animation, no AI story',
                    'MUI / Chakra — great for dense app UIs, shallow on the cinematic visuals that make marketing pages memorable',
                    'UI HUB — the only one that ships animated source, a structured AI prompt and an MCP server for every component',
                ],
            },
            {
                heading: 'The advantages of UI HUB',
                bullets: [
                    '100% source transparency — clean, commented React / TypeScript for every component',
                    'AI-ready everywhere — a universal blueprint plus system-specific prompts (Advance, Antigravity, Claude, Cursor, Lovable)',
                    'One library for cinematic and utility — 3D heroes, cursors, backgrounds, buttons and navbars share one design language',
                    'Works with your stack — React 19, TypeScript, Tailwind 4, Vite and Framer Motion, with HTML / CSS flavours ready to adapt',
                    'Consistent theme system — dark / light tokens you can plug into any project',
                    'Built-in Vibe engine — regenerate or remix a component right on its page, no external AI tool required',
                    'Free tier to start, Pro for premium components, full source code and AI upgrades',
                ],
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
                body: 'UI HUB is built around a simple loop: find a component, copy its prompt (and code), then let an AI assistant like Antigravity, Claude or Lovable generate or adapt it for you. Here is the whole flow in a few steps.',
            },
            {
                heading: 'The workflow',
                steps: [
                    {
                        title: 'Pick a component in the Library',
                        body: 'Open the Library sidebar and choose a category — or use the search bar. Every component opens in the Preview tab first, so you can see how it behaves before you copy anything.',
                    },
                    {
                        title: 'Copy the vibe prompt (or the raw code)',
                        body: 'Open the Vibe tab and copy the AI prompt — it describes the component in plain English so any AI tool can rebuild or remix it. Prefer to work directly? Open the Code tab and copy the full source.',
                    },
                    {
                        title: 'Paste it into your AI tool',
                        body: 'Drop the copied prompt into Antigravity, Claude Code, Claude.ai or Lovable. Include the copied source alongside it and the model produces a production-ready version for your stack and design language.',
                        code: {
                            lang: 'text',
                            label: 'Sample AI prompt',
                            content: 'Build a cinematic 3D hero section for my SaaS landing page.\nHere is the UI HUB vibe prompt to follow:\n-------------------------------------------\n<paste the Vibe prompt you copied>\n-------------------------------------------\nAlso use this component source as the visual reference:\n<the copied component code>\nReturn the full component code and list the dependencies.',
                        },
                    },
                    {
                        title: 'Generate it, then copy the result back',
                        body: 'Let the AI generate the variant. Copy the result into your project — the AI handles the scaffolding while you keep full control of the output.',
                    },
                ],
            },
            {
                heading: 'Where to paste it',
                body: 'The prompt is tool-agnostic. Paste it into any assistant and add whatever is specific to your project.',
                bullets: [
                    'Cursor — paste it into Composer or the Agent panel and press Enter',
                    'Claude Code — paste it straight into the terminal as a normal message',
                    'Claude.ai / ChatGPT — paste it into the chat and add any project-specific notes',
                    'Lovable — paste it into the prompt box and let it scaffold the app around it',
                    'GitHub Copilot — drop it into your agent request or pull it in from the docs',
                    'Or skip external tools entirely — open the component\u2019s Vibe tab and regenerate it right where you are',
                ],
            },
            {
                heading: 'Theme, dependencies & the built-in Vibe tab',
                body: 'Reactive components accept a theme prop — UI HUB ships a ThemeContext for dark / light mode via useTheme(); pass a per-component theme prop to override it locally. Many components rely on lucide-react (icons) and framer-motion (animation); your AI tool will list the exact dependencies to install.',
                bullets: [
                    'No external tool needed — the Vibe tab on any component lets the built-in AI assistants rewrite it on the spot.',
                ],
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
                heading: 'Power of UI MCP',
                bullets: [
                    'Discover 100+ components from inside your AI tool — search by name, category, framework, styling or tags',
                    'Fetch full source code, dependencies and install notes instantly, copy-paste ready',
                    'Search reusable templates and animations the same way you search components',
                    'One API key works across Cursor, Claude Code, VS Code / Copilot and Antigravity',
                    'Server-side Pro gating — premium components unlock automatically for paying members',
                ],
            },
            {
                heading: 'How to use MCP with AI',
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
                        title: 'Important: paste the full config, not just the URL',
                        body: 'A bare endpoint URL (https://ui-hub-mcp.onrender.com/mcp) will NOT connect on its own — the server answers unauthenticated requests with "Unauthorized: Missing API key. Use the header Authorization: Bearer uh_live_...". Always paste the complete config block (or the claude mcp add command) that includes the Authorization header with your key, so your AI tool can authenticate and list tools.',
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
                body: 'Free accounts can search UI HUB components via MCP with a daily request limit. Pro unlocks premium components, templates, animations, full source code and higher usage. All limits are enforced server-side by the MCP server.',
                table: {
                    headers: ['Feature', 'Free', 'Pro'],
                    rows: [
                        ['Component search', '✓ Free components', '✓ All components'],
                        ['Templates', 'Limited', '✓ All templates'],
                        ['Animations', 'Limited', '✓ All animations'],
                        ['Full source code', '—', '✓ All source code'],
                        ['Premium components', '—', '✓ Unlocked automatically'],
                        ['Rate limit', 'Daily request limit', 'Higher usage limit'],
                        ['AI tools (Cursor, Claude Code, VS Code / Copilot, Antigravity)', '✓', '✓ With extras'],
                        ['Support', 'Standard', 'Priority'],
                    ],
                },
                bullets: [
                    'Every limit is enforced server-side — an API key tied to a Free account simply cannot read premium source.',
                    'Admins and ELITE accounts get full access to everything.',
                ],
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
