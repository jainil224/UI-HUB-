# UI HUB — ONE-REUSE COMPONENT PROMPT

Copy everything below (from `You are the UI HUB component builder...` to `"add this to UI HUB" -> do all the tasks above.`), replace `<ENTER THE NAME HERE>`, and send it. The AI will design, build, register, capture, and verify the component end-to-end. Optionally fill in `CATEGORY`; otherwise the AI picks the best existing category.

---

You are the UI HUB component builder. Add a NEW component to this repository
(working copy: C:\Users\Admin\Documents\GitHub\UI-HUB-). Use ONLY the
knowledge base in .agents\skills\ui-hub-component-builder\ (start with SKILL.md,
then taxonomy.md, source-map.md, and the category docs for the chosen category)
to design, build, and register it. Do NOT invent libraries: reuse the existing
stack (React 19 + TypeScript, Tailwind v4, deps already in frontend/package.json,
Canvas2D / three as already used).

NEW COMPONENT:  <ENTER THE NAME HERE>
CATEGORY:       (leave blank to let me choose the best existing one)

Deliverables — do ALL of these:

1. DESIGN: decide the concept + category and write the full spec suite into
   .agents\skills\ui-hub-component-builder\selected-component\<name>\
   (concept, architecture, api-spec, interaction-spec, visual-spec,
   performance-spec, responsive-accessibility, acceptance-criteria,
   registry-integration, implementation-plan, verification-plan,
   IMPLEMENTATION_PROMPT, README).

2. BUILD: create the component in frontend\src\components\ui\, zero NEW
   runtime dependencies, following the performance/accessibility rules in the
   skill (single rAF loop where relevant, DPR cap, offscreen parking,
   prefers-reduced-motion support, cleanup of listeners).

3. DELIVERABLE FILE: write .agents\skills\ui-hub-component-builder\
   selected-component\<name>\<name>.md containing: name + category + concept,
   the master prompt, the 5 vibe prompts (advance, claude, cursor, antigravity,
   lovable), the FULL component code pasted inline, and ALL instructions
   (props, usage, how to register, MCP, screenshot).

4. REGISTER: frontend\src\data\componentData.tsx (lazy import, UI_COMPONENTS
   entry, inline preview, registry entry in the correct category),
   componentMetadata.ts (props + vibeMeta), embeddedSourceCode.ts and
   componentFullSources.ts (exact source strings), and the 3 prompt maps
   (claudePrompts.ts, antigravityPrompts.ts, lovablePrompts.ts).

5. MCP: add the file mapping to mcp-server\scripts\sync-frontend-data.mjs
   DISK_OVERRIDES, regenerate data (node scripts/sync-frontend-data.mjs from
   mcp-server), rebuild (npm run build). Free-tier by default; never touch
   premiumComponents.ts.

6. SCREENSHOT: add the id to scripts\announcement\capture-previews.mjs
   CURATED_IDS and capture frontend\public\assets\component-previews\<id>.png.

7. VERIFY: npx tsc --noEmit + npm run build (frontend), npm run build +
   npx vitest run (mcp-server), and a grep so every reference is registered.
   Fix any failure.

8. SCOPE: never remove/restructure existing entries, never commit or push to
   GitHub — leave changes local for manual review.

"add this to UI HUB" -> do all the tasks above.