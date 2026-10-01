/**
 * Task Router taxonomy and routing matrix — agent.md tasks 8.2 – 8.8.
 *
 * This module is the single source of truth for:
 *
 *   CATEGORIES  8.2  the taxonomy, seeded from the Phase 7 task category catalog
 *   INTENTS     8.4  FIX / ADD / MODIFY / ... determined separately from category
 *   SURFACES    8.5  FRONTEND / BACKEND / MCP / ... which part of the product
 *   ROUTING     8.7  category → knowledge + indexes
 *   MATRIX      8.8  the full per-category record, emitted as ROUTING_MATRIX.json
 *
 * Two design rules from agent.md shape everything here.
 *
 * 1. 8.3 — "Do NOT classify purely by keyword." Every category therefore carries
 *    `evidence`, split into STRONG (an index entity actually resolved: a feature
 *    slug, a route, an endpoint, a file path, a symbol) and WEAK (a bare word or
 *    path-shape hint). `lib/router.mjs` will not let a category reach HIGH
 *    confidence on WEAK evidence alone.
 *
 * 2. 8.9 — "Do not use a fake precision." Nothing here is a percentage. Weights
 *    are small integers used only to order candidates; the reason string is
 *    always carried alongside so a ranking can be argued with.
 *
 * The category list is deliberately short (agent.md 8.2: "Do not create dozens
 * of unnecessary categories"). Sixteen categories cover every UI HUB subsystem.
 */

export const ROUTER_VERSION = '1.0.0';
export const PHASE = 8;

/* ------------------------------------------------------------------ *
 * 8.2 — Task categories
 * ------------------------------------------------------------------ */

const KB = '.uihub-agent/';

/**
 * `strong` entries are matched against resolved index entities.
 * `weak` entries are lowercased substrings and carry far less weight; they can
 * only ever produce a MEDIUM or LOW classification on their own.
 */
export const CATEGORIES = {
  UI: {
    summary: 'Frontend presentation, layout, styling and rendering.',
    strong: { features: ['home-page', 'legal', 'pricing-page', 'build-with-uihub-page', 'preview-capture-page'] },
    weak: { words: ['ui', 'frontend', 'page', 'layout', 'render', 'responsive', 'screen'], paths: ['^frontend/src/(pages|components)/'] },
    surfaces: ['FRONTEND'],
    routing: {
      primaryIndexes: ['PAGE_MAP', 'COMPONENT_MAP', 'FEATURE_MAP'],
      secondaryIndexes: ['SERVICE_MAP', 'FILE_ROLE_MAP'],
      knowledge: ['design-system/DESIGN_SYSTEM.md', 'features/FEATURES.md'],
      sourceRoots: ['frontend/src'],
      protected: [],
      validation: ['frontend build', 'frontend tests'],
    },
  },

  COMPONENT: {
    summary: 'A specific React component: its props, state, behaviour or reuse.',
    strong: { roles: ['COMPONENT'] },
    weak: { words: ['component', 'card', 'button', 'modal', 'modal', 'carousel', 'slider', 'grid', 'rail', 'stage'], paths: ['/components/[^/]+\\.tsx?$'] },
    surfaces: ['FRONTEND'],
    routing: {
      primaryIndexes: ['COMPONENT_MAP', 'SYMBOL_INDEX', 'PAGE_COMPONENT_INDEX'],
      secondaryIndexes: ['FILE_ROLE_MAP', 'REVERSE_DEPENDENCY_MAP'],
      knowledge: ['design-system/DESIGN_SYSTEM.md', 'features/FEATURES.md'],
      sourceRoots: ['frontend/src/components'],
      validation: ['frontend build', 'frontend tests'],
    },
  },

  TEMPLATE: {
    summary: 'The template marketplace: previews, cards, galleries, source and data.',
    strong: { features: ['templates-page', 'build-with-uihub-page', 'preview-capture-page'] },
    weak: { words: ['template', 'templates', 'marketplace', 'gallery', 'preview', 'webm', 'webm', 'thumbnail'], paths: ['/components/templates/'] },
    surfaces: ['FRONTEND'],
    routing: {
      primaryIndexes: ['FEATURE_MAP', 'COMPONENT_MAP', 'PAGE_MAP'],
      secondaryIndexes: ['SERVICE_MAP', 'PAGE_COMPONENT_INDEX'],
      knowledge: ['features/FEATURES.md'],
      sourceRoots: ['frontend/src/components/templates', 'frontend/src/pages/TemplatesPage'],
      protected: ['frontend/src/data/templatesData.ts', 'frontend/src/components/templates/registry.ts'],
      validation: ['frontend build', 'frontend tests', 'mcp tests'],
    },
  },

  AUTHENTICATION: {
    summary: 'Login, signup, sessions, Firebase ID tokens, entitlement checks.',
    strong: { features: ['auth', 'auth-context', 'access-service'], integrations: ['firebase'] },
    weak: { words: ['auth', 'authentication', 'login', 'signup', 'sign-up', 'logout', 'session', 'token', 'password', 'profile', 'jwt', 'unauthenticated'] },
    surfaces: ['FRONTEND', 'BACKEND'],
    routing: {
      primaryIndexes: ['SERVICE_MAP', 'API_MAP', 'FILE_ROLE_MAP'],
      secondaryIndexes: ['COMPONENT_MAP', 'INTEGRATION_MAP'],
      knowledge: ['security/SECURITY_OVERVIEW.md', 'rules/PROTECTED_PATHS.md', 'features/FEATURES.md'],
      sourceRoots: ['backend/src/middleware', 'frontend/src/pages/Auth'],
      protected: ['backend/src/middleware/auth.js', 'backend/src/services/accessService.js', 'mcp-server/src/middleware/auth.ts'],
      validation: ['backend tests', 'frontend tests', 'mcp tests'],
    },
  },

  PAYMENT: {
    summary: 'Razorpay orders, payment verification, pricing and premium entitlement.',
    strong: { features: ['payment-routes', 'pricing-page'], integrations: ['razorpay'], paths: ['paymentRoutes', 'verifySignature'] },
    weak: { words: ['payment', 'pay', 'razorpay', 'checkout', 'order', 'invoice', 'billing', 'subscription', 'premium', 'entitlement'] },
    surfaces: ['BACKEND', 'FRONTEND'],
    routing: {
      primaryIndexes: ['API_MAP', 'SERVICE_MAP', 'INTEGRATION_MAP'],
      secondaryIndexes: ['COMPONENT_MAP', 'DATABASE_USAGE_MAP'],
      knowledge: ['rules/DO_NOT_CHANGE.md', 'rules/PROTECTED_PATHS.md', 'security/SECURITY_OVERVIEW.md'],
      sourceRoots: ['backend/src/routes', 'backend/src/services'],
      protected: ['backend/src/routes/paymentRoutes.js', 'backend/src/utils/verifySignature.js', 'backend/src/config/premiumComponents.js'],
      validation: ['backend tests', 'frontend build'],
      ownerAction: true,
    },
  },

  ADMIN: {
    summary: 'The admin dashboard, its guard, and admin-only routes.',
    strong: { features: ['admin', 'dashboard'], paths: ['/pages/Admin/'] },
    weak: { words: ['admin', 'dashboard', 'moderation', 'metrics', 'analytics', 'audit', 'overview'] },
    surfaces: ['FRONTEND', 'BACKEND'],
    routing: {
      primaryIndexes: ['PAGE_MAP', 'ROUTE_MAP', 'API_MAP'],
      secondaryIndexes: ['COMPONENT_MAP', 'SERVICE_MAP'],
      knowledge: ['infrastructure/INFRASTRUCTURE.md', 'features/FEATURES.md', 'rules/PROTECTED_PATHS.md'],
      sourceRoots: ['frontend/src/pages/Admin', 'frontend/src/components/admin', 'backend/src/routes'],
      protected: ['mcp-server/src/middleware/requireAdmin.ts', 'mcp-server/src/middleware/dashboardAuth.ts'],
      validation: ['frontend tests', 'mcp tests', 'backend tests'],
    },
  },

  MCP: {
    summary: 'The Model Context Protocol server: tools, resources, dashboard, auth.',
    strong: { features: ['mcp', 'dashboard'], paths: ['^mcp-server/'], tools: ['list_all_components', 'get_component', 'search_components', 'get_template', 'list_categories'] },
    weak: { words: ['mcp', 'tool', 'tools', 'claude', 'llm', 'context protocol', 'playground', 'api-key', 'apikey'] },
    surfaces: ['MCP'],
    routing: {
      primaryIndexes: ['API_MAP', 'FILE_ROLE_MAP', 'INTEGRATION_MAP'],
      secondaryIndexes: ['SERVICE_MAP', 'SYMBOL_INDEX'],
      knowledge: ['APIs/MCP_DEPLOYMENT_CONTRACT.md', 'architecture/ARCHITECTURE.md', 'rules/PROTECTED_PATHS.md'],
      sourceRoots: ['mcp-server/src'],
      protected: ['mcp-server/src/middleware/auth.ts', 'mcp-server/src/middleware/dashboardAuth.ts', 'mcp-server/src/middleware/requireAdmin.ts', 'mcp-server/src/services/apiKeyService.ts'],
      validation: ['mcp tests', 'mcp build'],
    },
  },

  API: {
    summary: 'Backend HTTP surface: routes, controllers, request validation, responses.',
    strong: { roles: ['ROUTE_CONFIG', 'CONTROLLER', 'MIDDLEWARE'], paths: ['^backend/src/routes/'] },
    weak: { words: ['api', 'endpoint', 'route', 'request', 'response', 'handler', 'controller', 'rest', 'status code', 'payload'] },
    surfaces: ['BACKEND'],
    routing: {
      primaryIndexes: ['API_MAP', 'SERVICE_MAP', 'ROUTE_MAP'],
      secondaryIndexes: ['DATABASE_USAGE_MAP', 'INTEGRATION_MAP', 'COMPONENT_MAP'],
      knowledge: ['APIs/API_OVERVIEW.md', 'APIs/API_ARCHITECTURE.md', 'architecture/ARCHITECTURE.md'],
      sourceRoots: ['backend/src/routes', 'backend/src/controllers', 'backend/src/middleware'],
      protected: ['backend/src/server.js', 'backend/src/routes/', 'backend/src/middleware/validators.js'],
      validation: ['backend tests', 'backend tests'],
    },
  },

  DATABASE: {
    summary: 'Mongo access, collections, models, migrations and query shape.',
    strong: { features: ['mongo-service'], roles: ['MODEL'], paths: ['mongoService', 'mongo\\.ts$'] },
    weak: { words: ['database', 'db', 'mongo', 'mongodb', 'collection', 'model', 'schema', 'migration', 'index', 'query', 'document', 'document'] },
    surfaces: ['BACKEND', 'MCP'],
    routing: {
      primaryIndexes: ['DATABASE_USAGE_MAP', 'SERVICE_MAP', 'API_MAP'],
      secondaryIndexes: ['INTEGRATION_MAP', 'STORAGE_USAGE_MAP'],
      knowledge: ['data/DATA_OVERVIEW.md', 'architecture/ARCHITECTURE.md'],
      // There is no `backend/src/models`: DATABASE_USAGE_MAP records zero mongoose
    // models, and the collections are reached from data, routes and services.
    // Claiming a directory that does not exist would point every database task
    // at nothing.
    sourceRoots: ['backend/src/data', 'backend/src/services', 'mcp-server/src/services'],
      protected: ['backend/src/services/mongoService.js', 'mcp-server/src/services/mongo.ts'],
      validation: ['backend tests', 'mcp tests'],
      ownerAction: true,
      ownerActionReason: 'Any change to collections or models needs an owner-run migration against production.',
    },
  },

  STORAGE: {
    summary: 'Redis and browser storage: rate limiting, caching, persistence keys.',
    strong: { features: ['push-service'], integrations: ['upstash-redis'] },
    weak: { words: ['storage', 'redis', 'cache', 'caching', 'localstorage', 'session storage', 'persist', 'key', 'ttl'] },
    surfaces: ['MCP', 'FRONTEND'],
    routing: {
      primaryIndexes: ['STORAGE_USAGE_MAP', 'SERVICE_MAP'],
      secondaryIndexes: ['INTEGRATION_MAP', 'API_MAP'],
      knowledge: ['data/DATA_OVERVIEW.md', 'infrastructure/ENVIRONMENT_CONTRACT.md'],
      sourceRoots: ['mcp-server/src/middleware', 'mcp-server/src/routes'],
      protected: ['mcp-server/src/middleware/rateLimiter.ts'],
      validation: ['mcp tests'],
    },
  },

  SECURITY: {
    summary: 'CORS, headers, rate limiting, secrets, signature verification.',
    strong: {
      integrations: ['security-headers', 'rate-limiting'],
      paths: ['corsPolicy', 'verifySignature', 'rateLimiters?\\.'],
      concepts: ['xss', 'csrf', 'sql injection', 'nosql injection', 'injection', 'vulnerability', 'exploit',
        'sanitiz', 'xxe', 'ssrf', 'auth bypass', 'bypass auth', 'privilege escalation', 'helmet',
        'rate limit', 'ratelimit', 'cors misconfig', 'security header', 'secret leak', 'credential leak',
        'hardcoded secret', 'insecure', 'untrusted'],
    },
    weak: { words: ['security', 'cors', 'signature', 'secret', 'credential'] },
    surfaces: ['BACKEND', 'MCP', 'DEPLOYMENT'],
    routing: {
      primaryIndexes: ['INTEGRATION_MAP', 'API_MAP', 'FILE_ROLE_MAP'],
      secondaryIndexes: ['SERVICE_MAP', 'DATABASE_USAGE_MAP'],
      knowledge: ['security/SECURITY_OVERVIEW.md', 'security/SECRET_HANDLING.md', 'security/SECURITY_VALIDATION.md', 'APIs/CORS_CONTRACT.md', 'rules/PROTECTED_PATHS.md'],
      sourceRoots: ['backend/src/config', 'backend/src/middleware', 'mcp-server/src/config', 'mcp-server/src/middleware'],
      protected: ['backend/src/config/corsPolicy.js', 'mcp-server/src/config/corsPolicy.ts', 'backend/src/middleware/rateLimiters.js', 'backend/src/utils/verifySignature.js', 'mcp-server/src/config/env.ts'],
      validation: ['npm run check:secrets', 'backend tests', 'mcp tests'],
      ownerAction: true,
    },
  },

  PERFORMANCE: {
    summary: 'Load time, render cost, bundle size, query efficiency, responsiveness.',
    strong: {},
    weak: { words: ['performance', 'slow', 'slower', 'slowly', 'optimize', 'optimise', 'optimization', 'speed', 'fast', 'latency', 'lag', 'jank', 'bundle', 'lazy', 'memo', 'render time', 'rendering', 'rerender', 're-render', 'fps', 'memory leak', 'blocking', 'heavy'] },
    surfaces: [],
    routing: {
      primaryIndexes: ['COMPONENT_MAP', 'IMPORT_GRAPH', 'PAGE_COMPONENT_INDEX'],
      secondaryIndexes: ['FEATURE_MAP', 'SERVICE_MAP'],
      knowledge: ['features/FEATURES.md', 'architecture/ARCHITECTURE.md'],
      sourceRoots: [],
      protected: [],
      validation: ['frontend build', 'frontend tests'],
    },
    note: 'PERFORMANCE is an overlay category: it names a quality axis, not a subsystem, so it carries no source roots of its own. It is always combined with the subsystem it affects.',
  },

  DEPLOYMENT: {
    summary: 'Vercel, Render, Cloudflare, environment variables, build and hosting.',
    strong: {
      paths: ['^vercel\\.json$', '^render\\.yaml$', 'cloudflare', 'Dockerfile'],
      concepts: ['deployment', 'deploy', 'hosting', 'vercel', 'cloudflare', 'environment variable', 'env var',
        'render.yaml', 'vercel.json', 'build config', 'ci pipeline', 'cdn', 'edge function'],
    },
    weak: { words: ['deploy', 'deployment', 'hosting', 'vercel', 'render', 'cloudflare', 'build', 'ci', 'cd', 'pipeline', 'environment', 'env', 'env var', 'origin', 'cors-origin'] },
    surfaces: ['DEPLOYMENT'],
    routing: {
      primaryIndexes: ['INTEGRATION_MAP', 'FILE_ROLE_MAP'],
      secondaryIndexes: ['API_MAP', 'SERVICE_MAP'],
      knowledge: ['infrastructure/INFRASTRUCTURE.md', 'infrastructure/DEPLOYMENT_MAP.md', 'infrastructure/ENVIRONMENT_CONTRACT.md', 'infrastructure/DEPLOYMENT_CONFLICTS.md', 'infrastructure/CONFIGURATION_OWNERSHIP.md'],
      sourceRoots: ['backend/src/config', 'mcp-server/src/config'],
      protected: ['vercel.json', 'render.yaml', 'mcp-server/render.yaml', 'mcp-server/src/config/env.ts'],
      validation: ['npm run check:config', 'npm run check:index', 'mcp tests'],
      ownerAction: true,
      ownerActionReason: 'Deployment topology is owner-owned; see infrastructure/CONFIGURATION_OWNERSHIP.md.',
    },
  },

  DOCUMENTATION: {
    summary: 'Agent knowledge base, READMEs, inline docs, ADRs.',
    strong: {
      paths: ['README', '\\.md$', '^agent\\.md$'],
      concepts: ['readme', 'documentation', 'docs', 'changelog', 'jsdoc', 'docstring', 'knowledge base',
        'agent.md', 'architecture decision', 'adr', 'write-up', 'inline comment', 'code comment'],
    },
    weak: { words: ['comment', 'comments', 'explain', 'guide'] },
    surfaces: ['DOCUMENTATION'],
    routing: {
      primaryIndexes: [],
      secondaryIndexes: ['FILE_ROLE_MAP'],
      knowledge: ['PROJECT_CONTEXT.md', 'AGENT.md'],
      sourceRoots: [],
      protected: ['agent.md'],
      validation: ['npm run check:knowledge', 'npm run check:docs'],
    },
  },

  TESTING: {
    summary: 'Test suites, fixtures, coverage, test-only failures.',
    strong: {
      roles: ['TEST'],
      paths: ['(^|/)(tests?|__tests__|spec)/', '\\.(test|spec)\\.[jt]sx?$'],
      concepts: ['unit test', 'integration test', 'e2e test', 'test suite', 'test coverage', 'test fixture',
        'flaky test', 'failing test', 'snapshot test', 'vitest', 'jest', 'pytest', 'playwright', 'supertest'],
    },
    weak: { words: ['test', 'tests', 'testing', 'spec', 'coverage', 'fixture', 'assertion', 'assert'] },
    surfaces: [],
    routing: {
      primaryIndexes: ['FILE_ROLE_MAP'],
      secondaryIndexes: ['IMPORT_GRAPH'],
      knowledge: ['PROJECT_CONTEXT.md'],
      sourceRoots: [],
      protected: [],
      validation: ['all suites'],
    },
  },

  INFRASTRUCTURE: {
    summary: 'Build tooling, CI, scripts, agents, the knowledge base itself.',
    strong: { roles: ['SCRIPT'], paths: ['^scripts/', '^\\.github/'] },
    weak: { words: ['infra', 'infrastructure', 'tooling', 'workflow', 'ci', 'script', 'automation', 'pipeline', 'monorepo', 'config', 'configuration'] },
    surfaces: ['DEPLOYMENT', 'DOCUMENTATION'],
    routing: {
      primaryIndexes: ['FILE_ROLE_MAP'],
      secondaryIndexes: ['IMPORT_GRAPH'],
      knowledge: ['infrastructure/INFRASTRUCTURE.md', 'infrastructure/TRACKING_MODEL.md', 'PROJECT_CONTEXT.md'],
      sourceRoots: ['.uihub-agent/scripts'],
      protected: [],
      validation: ['npm run check', 'npm run check:index'],
    },
  },

  DESIGN_SYSTEM: {
    summary: 'Tokens, theme, primitives, spacing, colour and the live CSS entrypoint.',
    strong: {
      paths: ['index\\.css$', '/design-system/'],
      concepts: ['design token', 'design system', 'tailwind', 'theme', 'css variable', 'typography',
        'palette', 'dark mode', 'light mode', 'spacing scale', 'style guide', 'variant'],
    },
    weak: { words: ['design system', 'design-system', 'theme', 'token', 'tokens', 'spacing', 'colour', 'color', 'palette', 'typography', 'font', 'dark mode', 'light mode', 'css variable', 'style guide', 'consistency'] },
    surfaces: ['FRONTEND'],
    routing: {
      primaryIndexes: ['COMPONENT_MAP', 'SYMBOL_INDEX'],
      secondaryIndexes: ['FILE_ROLE_MAP'],
      knowledge: ['design-system/DESIGN_SYSTEM.md'],
      sourceRoots: ['frontend/src/components/ui', 'frontend/src/index.css'],
      protected: ['frontend/src/index.css'],
      validation: ['frontend build', 'frontend tests'],
    },
  },

  USER_LIBRARY: {
    summary: "A user's saved components and templates, favourites, collections.",
    strong: { features: ['library-page', 'favorites-routes', 'favorites-service', 'collections-routes', 'collections-service'] },
    weak: { words: ['library', 'my components', 'saved', 'favourite', 'favorite', 'favorites', 'collection', 'bookmark', 'wishlist'] },
    surfaces: ['FRONTEND', 'BACKEND'],
    routing: {
      primaryIndexes: ['FEATURE_MAP', 'PAGE_MAP', 'API_MAP'],
      secondaryIndexes: ['SERVICE_MAP', 'COMPONENT_MAP'],
      knowledge: ['features/FEATURES.md'],
      sourceRoots: ['frontend/src/pages/LibraryPage', 'backend/src/routes'],
      protected: ['backend/src/routes/favoritesRoutes.js'],
      validation: ['backend tests', 'frontend tests'],
    },
  },
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

/* ------------------------------------------------------------------ *
 * 8.4 — Task intent, determined separately from category.
 *
 * Intent comes from the verb, not from the noun. "Why is preview slow?" and
 * "Fix preview loading" share a subsystem and differ in intent, which is
 * exactly the split agent.md 8.4 asks for.
 * ------------------------------------------------------------------ */

export const INTENTS = {
  FIX: { words: ['fix', 'broken', 'break', 'breaks', 'broken', 'bug', 'regression', 'fails', 'failing', 'failure', 'error', 'crash', 'wrong', 'incorrect', 'issue', 'problem', 'doesn\'t work', 'not working', 'stopped working', 'repair', 'patch', 'hotfix'] },
  ADD: { words: ['add', 'create', 'new', 'introduce', 'build', 'implement', 'support', 'scaffold', 'generate'] },
  MODIFY: { words: ['change', 'modify', 'update', 'edit', 'adjust', 'tweak', 'rename', 'replace', 'swap', 'move', 'set', 'configure'] },
  REMOVE: { words: ['remove', 'delete', 'drop', 'remove', 'deprecate', 'retire', 'clean up', 'uninstall'] },
  REFACTOR: { words: ['refactor', 'restructure', 'reorganise', 'reorganize', 'extract', 'inline', 'simplify', 'clean up', 'tidy', 'consolidate', 'dedupe', 'deduplicate'] },
  OPTIMIZE: { words: ['optimize', 'optimise', 'speed up', 'faster', 'reduce', 'improve performance', 'performance', 'make it faster', 'cut', 'lower', 'minimize', 'minimise'] },
  DEBUG: { words: ['debug', 'diagnose', 'troubleshoot', 'reproduce', 'trace', 'step through', 'why is', 'why does', 'why are', 'why do', 'whats wrong', "what's wrong"] },
  INVESTIGATE: { words: ['why', 'investigate', 'explore', 'understand', 'research', 'find out', 'learn', 'audit', 'look into', 'what is', 'what does', 'how does', 'check', 'review', 'inspect', 'examine'] },
  DOCUMENT: { words: ['document', 'docs', 'documentation', 'comment', 'jsdoc', 'readme', 'explain', 'write up', 'write-up', 'changelog'] },
  TEST: { words: ['test', 'tests', 'add tests', 'cover', 'coverage', 'spec', 'assert', 'verify it works'] },
  AUDIT: { words: ['audit', 'review', 'compliance', 'security review', 'lint', 'drift', 'verify no', 'double check'] },
};

export const INTENT_NAMES = Object.keys(INTENTS);

/* ------------------------------------------------------------------ *
 * 8.5 — Task surface.
 *
 * A task can span surfaces; the router returns an array. ROLE → SURFACE comes
 * from the Phase 7 FILE_ROLE_MAP rather than from path guessing.
 * ------------------------------------------------------------------ */

export const ROLE_SURFACE = {
  COMPONENT: 'FRONTEND',
  PAGE: 'FRONTEND',
  HOOK: 'FRONTEND',
  STATE: 'FRONTEND',
  TYPE: 'FRONTEND',
  UTILITY: 'FRONTEND',
  BARREL: 'FRONTEND',
  ROUTE_CONFIG: 'FRONTEND',
  ENTRY: 'FRONTEND',
  SERVICE: 'BACKEND',
  CONTROLLER: 'BACKEND',
  MIDDLEWARE: 'BACKEND',
  CONFIG: 'DEPLOYMENT',
  MODEL: 'DATABASE',
  MCP_TOOL: 'MCP',
  SCRIPT: 'INFRASTRUCTURE',
  TEST: 'UNKNOWN',
  DATA: 'UNKNOWN',
  TEMPLATE: 'UNKNOWN',
  UNKNOWN: 'UNKNOWN',
};

export const SURFACES = ['FRONTEND', 'BACKEND', 'MCP', 'DATABASE', 'DEPLOYMENT', 'DOCUMENTATION', 'MULTI_SURFACE', 'UNKNOWN'];

/** Path prefix → surface, used only when no indexed role is available. */
export const PATH_SURFACE = [
  { re: /^frontend\//, surface: 'FRONTEND' },
  { re: /^backend\//, surface: 'BACKEND' },
  { re: /^mcp-server\//, surface: 'MCP' },
  { re: /^cli\//, surface: 'DOCUMENTATION' },
  { re: /^scripts\//, surface: 'INFRASTRUCTURE' },
  { re: /^\.github\//, surface: 'INFRASTRUCTURE' },
  { re: /^\.uihub-agent\//, surface: 'DOCUMENTATION' },
];

/* ------------------------------------------------------------------ *
 * 8.21 — Protected-path classification.
 *
 * The three levels agent.md 8.21 asks for are derived from the tiers that
 * already exist in rules/PROTECTED_PATHS.md. The mapping is:
 *
 *   CRITICAL / DO_NOT_CHANGE section  → REQUIRES_EXPLICIT_TASK_INTENT
 *   HIGH RISK / GENERATED            → CAUTION
 *   SAFE / NORMAL, everything else   → NORMAL
 *
 * Parsing the real file (see lib/protected.mjs) rather than restating the list
 * here means the router cannot drift from the rules.
 * ------------------------------------------------------------------ */

export const PROTECTED_TIER_MAP = {
  'CRITICAL': 'REQUIRES_EXPLICIT_TASK_INTENT',
  'HIGH RISK': 'CAUTION',
  'GENERATED': 'CAUTION',
  'DOCUMENTATION': 'CAUTION',
  'SAFE / NORMAL': 'NORMAL',
};

export const PROTECTED_CLASSES = ['NORMAL', 'CAUTION', 'REQUIRES_EXPLICIT_TASK_INTENT'];

/** 8.52 — categories that always raise HIGH CAUTION. */
export const HIGH_CAUTION_CATEGORIES = ['PAYMENT', 'AUTHENTICATION', 'SECURITY', 'DATABASE', 'DEPLOYMENT', 'MCP'];

/* ------------------------------------------------------------------ *
 * 8.38 — Context priority bands.
 * ------------------------------------------------------------------ */

export const PRIORITY = {
  P0: 'direct target',
  P1: 'direct dependency',
  P2: 'direct consumer',
  P3: 'shared service',
  P4: 'supporting knowledge',
  P5: 'optional context',
};

export const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'];

/* ------------------------------------------------------------------ *
 * 8.13 — Expansion guardrails.
 *
 * agent.md 8.13 is explicit that these are guidelines, not hard limits: "These
 * are guidelines, not hard-coded universal limits. A database migration task may
 * legitimately require more context than a button-style change."
 *
 * They are therefore defaults that EXPANSION GROWS, and the bundle always
 * reports the actual size rather than pretending it hit a target.
 * ------------------------------------------------------------------ */

export const EXPANSION = {
  initialTarget: { min: 5, max: 15 },
  stepTarget: { min: 5, max: 10 },
  /** Beyond this multiple of the initial set, expansion needs explicit evidence. */
  largeExpansionFactor: 3,
  /** Categories allowed a wider initial set because their blast radius is real. */
  wideInitialCategories: ['DATABASE', 'DEPLOYMENT', 'SECURITY', 'PAYMENT', 'API', 'MCP'],
};

/* ------------------------------------------------------------------ *
 * 8.12 — Legitimate reasons to add a file.
 *
 * Every expansion step must cite one of these. `lib/expand.mjs` rejects any
 * step without a reason, which is how "the directory is nearby" and "it is
 * convenient" (agent.md 8.12) are prevented mechanically rather than by asking
 * the model to be disciplined.
 * ------------------------------------------------------------------ */

export const EXPANSION_REASONS = {
  DIRECT_DEPENDENCY: 'a file this task already touches imports it',
  RELEVANT_CONSUMER: 'a file this task already touches is rendered by it',
  SHARED_SERVICE: 'a service reachable from more than one selected file',
  API_DEPENDENCY: 'an endpoint or handler this task already touches depends on it',
  STATE_DEPENDENCY: 'shared state or store that more than one selected file reads',
  PROTECTED_RELATIONSHIP: 'a selected file is protected, or protects another selected file',
  TEST_DEPENDENCY: 'a test that covers a selected file',
  ROUTE_RELATIONSHIP: 'a page on a route that a selected file serves',
  RUNTIME_EVIDENCE: 'runtime behaviour of a selected file requires it',
};

/* ------------------------------------------------------------------ *
 * 8.7 / 8.8 — the emitted routing matrix.
 * ------------------------------------------------------------------ */

/** Merge every category's routing records into the 8.8 matrix. */
export function buildRoutingMatrix() {
  const matrix = {};
  for (const [name, def] of Object.entries(CATEGORIES)) {
    matrix[name] = {
      category: name,
      summary: def.summary,
      surfaces: def.surfaces,
      strongEvidence: {
        features: def.strong.features ?? [],
        roles: def.strong.roles ?? [],
        integrations: def.strong.integrations ?? [],
        paths: def.strong.paths ?? [],
        tools: def.strong.tools ?? [],
        concepts: def.strong.concepts ?? [],
      },
      weakEvidence: {
        words: [...new Set(def.weak.words ?? [])].sort(),
        paths: def.weak.paths ?? [],
      },
      primaryIndexes: def.routing.primaryIndexes,
      secondaryIndexes: def.routing.secondaryIndexes,
      knowledge: def.routing.knowledge.map((k) => KB + k),
      sourceRoots: def.routing.sourceRoots,
      protectedAreas: def.routing.protected,
      requiredValidation: def.routing.validation,
      ownerActionRequired: !!def.ownerAction,
      ownerActionReason: def.ownerActionReason ?? null,
      highCautionByDefault: HIGH_CAUTION_CATEGORIES.includes(name),
      note: def.note ?? null,
    };
  }
  return {
    schemaVersion: 1,
    phase: PHASE,
    routerVersion: ROUTER_VERSION,
    generatedBy: '.uihub-agent/scripts/lib/router-matrix.mjs',
    description:
      'Task category → knowledge, indexes, source roots, protected areas and required validation. ' +
      'Read by lib/router.mjs and emitted as .uihub-agent/tasks/ROUTING_MATRIX.json and ' +
      '.uihub-agent/generated/KNOWLEDGE_ROUTING_GRAPH.json. Edit this file, not the JSON.',
    categories: matrix,
    intents: Object.fromEntries(
      INTENT_NAMES.map((i) => [i, { words: INTENTS[i].words }]),
    ),
    surfaces: { values: SURFACES, roleSurface: ROLE_SURFACE },
    protectedTiers: PROTECTED_TIER_MAP,
    priority: { bands: PRIORITY, order: PRIORITY_ORDER },
    expansion: {
      ...EXPANSION,
      reasons: EXPANSION_REASONS,
      note: 'Guidelines, not hard limits — see agent.md 8.13.',
    },
    highCautionCategories: HIGH_CAUTION_CATEGORIES,
  };
}

/**
 * The 8.50 knowledge routing graph: category → knowledge → index → source roots
 * → protected paths → validation, with every knowledge file checked against the
 * filesystem so a renamed doc shows up as a routing fault instead of a silent
 * miss at task time.
 */
export function buildKnowledgeRoutingGraph(knowledgeExists) {
  const matrix = buildRoutingMatrix();
  const nodes = [];
  const missingKnowledge = [];

  for (const [name, def] of Object.entries(matrix.categories)) {
    for (const k of def.knowledge) {
      const exists = knowledgeExists(k);
      if (!exists) missingKnowledge.push({ category: name, knowledge: k });
      nodes.push({ category: name, knowledge: k, exists });
    }
  }

  return {
    schemaVersion: 1,
    phase: PHASE,
    routerVersion: ROUTER_VERSION,
    generatedBy: '.uihub-agent/scripts/lib/router-matrix.mjs',
    description:
      'Machine-readable routing map: Task Category → Knowledge → Index → Source Roots → ' +
      'Protected Paths → Validation. Derived from ROUTING_MATRIX.json so the two cannot drift.',
    chain: ['category', 'knowledge', 'index', 'sourceRoots', 'protectedPaths', 'validation'],
    counts: {
      categories: Object.keys(matrix.categories).length,
      links: nodes.length,
      knowledgeFilesReferenced: [...new Set(nodes.map((n) => n.knowledge))].length,
      missingKnowledge: missingKnowledge.length,
    },
    missingKnowledge,
    links: nodes,
    categories: Object.fromEntries(
      Object.entries(matrix.categories).map(([name, def]) => [
        name,
        {
          knowledge: def.knowledge,
          indexes: [...def.primaryIndexes, ...def.secondaryIndexes],
          primaryIndexes: def.primaryIndexes,
          secondaryIndexes: def.secondaryIndexes,
          sourceRoots: def.sourceRoots,
          protectedPaths: def.protectedAreas,
          validation: def.requiredValidation,
          surfaces: def.surfaces,
        },
      ]),
    ),
  };
}