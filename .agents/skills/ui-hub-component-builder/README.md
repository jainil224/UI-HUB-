# UI HUB Component Builder — Knowledge Base

## Purpose

The **UI HUB Component Builder** skill is a reverse-engineered knowledge layer.
It documents precisely how the UI-HUB project
(`https://github.com/jainil224/UI-HUB-`) builds components in two categories:

1. **Interactive Background**
2. **Interactive Image**

It exists so that a future coding agent can understand how UI-HUB creates these
experiences **before being asked to build anything new**. It is a study artifact
(repository analysis + reusable patterns + rules), not a component list to copy
verbatim.

## Supported Categories

| Category | Repo category values (componentData.tsx:2632) | Primary docs |
|---|---|---|
| Interactive Background | `background`, `interactive-background` | `interactive-background/` |
| Interactive Image | `image-interaction` (+ `3d`, `scroll`, `footer`, `templates/` reverse-engineered cases) | `interactive-image/` |

## Scope Boundaries

- **In scope:** the two categories above, including every verified implementation.
- **Out of scope:** cursors, buttons, text animations, loaders, navbars,
  footers-as-category, forms, admin, routes, backend, APIs, and the MCP server.
  Some out-of-scope files were *read* because they contain interactive-image
  behavior (e.g. `HaulFooter.tsx` scroll parallax, template heroes), and they are
  documented only for their image-interaction relevance.
- **No category discovery, no competitor research, no trend research.** The
  taxonomy (`taxonomy.md`) is derived from what exists in the repository, not
  from industry lists.

## Repository Analyzed

- Working copy: `C:\Users\Admin\Documents\GitHub\UI-HUB-`
- Frontend root: `frontend/`
- Registry: `frontend/src/data/componentData.tsx` (category union at line 2632)
- Stack confirmed in `frontend/package.json`, `frontend/vite.config.ts`,
  `frontend/tailwind.config.ts`, `frontend/src/index.css`
- Analysis date: 2026-09-19

## How Future Agents Should Use This Knowledge

1. Read `taxonomy.md` to anchor vocabulary.
2. Read `source-map.md` to find existing implementations that already do what is
   needed (copy the *pattern*, follow the *dependencies.md* restrictions).
3. Read the category `SKILL.md` + `generation-rules.md` before touching any
   component in that category.
4. Read `shared/` before writing any interaction code — performance,
   responsive, and accessibility rules are mandatory, not suggestions.
5. Read `agent-memory.md` for the condensed "rules of the house".
6. Read `examples/index.md` to see the end-to-end lifecycle of an existing
   component (source → registry → embedded source → prompts → preview capture).

## File Map

```
SKILL.md                  entry skill (frontmatter + gate + quick rules)
README.md                 this file
taxonomy.md               category taxonomy (techniques + interaction dimensions)
source-map.md             component → file → deps → technique → category
technology-stack.md       verified technology/library stack
capability-matrix.md      capability × category × technology × evidence
agent-memory.md           condensed future-agent rules
evidence.md               confidence model + evidence log
shared/principles.md      observed/inferred/unknown patterns
shared/performance.md     performance rules
shared/responsive.md      responsive/mobile rules
shared/accessibility.md   accessibility + reduced-motion rules
shared/anti-patterns.md   risky patterns to avoid
interactive-background/   category docs (SKILL, implementations, patterns,
                          techniques, dependencies, performance-checklist,
                          generation-rules)
interactive-image/        category docs (same shape)
examples/index.md         annotated end-to-end lifecycle
```

## Validation Work

Every technical conclusion carries an evidence tag (file + line + confidence).
See `evidence.md` for the High/Medium/Low model. Production code was never
modified during this study.