# UI HUB — Production Feature Task
## Implement a Real, Persistent Template View Counter

You are working on the **UI HUB** production codebase.

UI HUB is a platform for discovering and using modern UI components, templates, animations, backgrounds, and other frontend resources.

The current **Templates** page displays view counts such as:

- `3.9k`
- `4.8k`
- `4.2k`

These values are currently temporary/static/frontend-generated and are **not a real persistent view-counting system**.

Your task is to replace the temporary implementation with a **production-quality, database-backed template view tracking system using the existing UI HUB architecture and Supabase setup**.

---

# 1. PRIMARY GOAL

Implement a real template view system where:

> When a user actually opens a template's detail/view page, that template receives a real persisted view.

The view count must:

- Be stored persistently in Supabase.
- Be associated with the correct template.
- Be displayed dynamically in the Templates UI.
- Avoid counting the same visitor repeatedly through simple page refreshes.
- Work for both authenticated and anonymous visitors.
- Be secure against direct client-side database manipulation.
- Work correctly after deployment on Vercel.
- Preserve the existing UI/UX and visual design.
- Avoid introducing unnecessary dependencies.

Do **not** rebuild unrelated parts of the UI HUB application.

---

# 2. FIRST: UNDERSTAND THE EXISTING CODEBASE

Before changing code, inspect the existing project.

Do not assume file names, database column names, route names, or component structure.

Identify:

### Frontend

Find:

- Templates listing page.
- Template card component.
- Template detail page.
- Template routing.
- Existing template data model/type/interface.
- Existing API/service layer.
- Existing Supabase client.
- Authentication implementation.
- Existing utility functions.
- Existing state management approach.
- Existing loading/error UI patterns.

### Backend / Database

Inspect:

- Existing Supabase project integration.
- Existing database schema.
- Existing `templates` table.
- Existing template primary key.
- Existing template slug/id structure.
- Existing RLS policies.
- Existing database functions/RPCs.
- Existing Edge Functions/API routes if present.
- Existing migrations.
- Existing analytics/event tables, if any.

### Important

Use the application's existing architecture and conventions.

For example:

If the application already uses:

```text
src/lib/supabase.ts
```

use the existing client.

If it has an established service layer, extend it instead of creating a second architecture.

If the project already has an API route or Supabase Edge Function pattern, follow that pattern.

Do not create duplicate Supabase clients.

Do not introduce an entirely new backend architecture just for this feature.

---

# 3. IMPORTANT VIEW-DEFINITION RULE

A view should be recorded when a user **actually opens the template detail page**.

Do NOT count:

- Template cards appearing in the Templates listing.
- Template cards being rendered.
- Scrolling through the Templates page.
- Hovering over a card.
- Image loading.
- Search results appearing.
- Lazy loading.
- Prefetching.

Example:

```text
User opens /templates
    ↓
30 templates displayed
    ↓
NO views are recorded
```

Then:

```text
User clicks "Mood Hero"
    ↓
/templates/mood-hero opens
    ↓
Record one view
```

This distinction is extremely important.

---

# 4. DUPLICATE VIEW PROTECTION

Do not implement:

```text
Every page refresh = +1
```

That would make the analytics inaccurate.

The desired behavior is:

```text
User opens template
→ +1 view

User refreshes same template during same browser session
→ +0

User revisits same template during the same session
→ +0

User opens a different template
→ +1

New browser session later
→ can generate another view
```

Use a lightweight anonymous visitor/session mechanism.

Prefer:

```text
sessionStorage
```

for the client-side session identifier.

Generate a random UUID once per browser session:

```text
uihub_view_session_id
```

Example conceptual flow:

```text
sessionStorage
    ↓
Get existing session ID
    ↓
If missing:
    generate UUID
    store it
    ↓
Open template
    ↓
send template ID + session ID
    ↓
server/database determines whether this session already viewed it
```

Do NOT use IP addresses as the primary deduplication mechanism.

Do NOT store unnecessary personal information.

---

# 5. DATABASE DESIGN

Use the existing database schema discovered during the initial investigation.

If there is already a suitable analytics/view table, reuse or extend it rather than creating a duplicate system.

If no suitable structure exists, implement a dedicated table similar to:

```sql
template_views
```

Recommended conceptual structure:

```text
template_views
-----------------------------
id
template_id
session_id
user_id        nullable
created_at
```

Where:

- `id` = unique event ID
- `template_id` = reference to the template
- `session_id` = anonymous browser-session identifier
- `user_id` = authenticated user ID if available
- `created_at` = timestamp

The exact data types must match the existing UI HUB schema.

For example, if templates use UUID primary keys, use UUID.

If templates use integer IDs, use integer.

Do not blindly copy this schema without checking the existing database.

---

# 6. UNIQUE CONSTRAINT

The database itself must protect against duplicate views.

Create a unique constraint/index conceptually equivalent to:

```sql
UNIQUE(template_id, session_id)
```

This is important because frontend-only duplicate protection is not enough.

Two browser requests could arrive simultaneously.

The database must remain the final authority.

For example:

```text
Request A → template 123 + session ABC
Request B → template 123 + session ABC

Both arrive nearly simultaneously

Database
→ only one view event is accepted
```

This makes the system race-condition resistant.

---

# 7. VIEW COUNT IMPLEMENTATION

There are two acceptable architectures.

Choose the one that best matches the existing UI HUB backend.

## Preferred architecture

Use:

```text
template_views
+
atomic server/database operation
```

When a new unique view is recorded:

```text
template_views INSERT succeeds
        ↓
template view count increments
```

Do not trust the frontend to increment the number.

The frontend must never execute something conceptually equivalent to:

```javascript
views + 1
```

and then write that value to the database.

The increment must happen atomically on the trusted side.

---

# 8. SUPABASE RPC / DATABASE FUNCTION

If appropriate for the existing architecture, create a PostgreSQL function/RPC similar conceptually to:

```text
record_template_view(template_id, session_id)
```

Responsibilities:

1. Validate template ID.
2. Validate session ID.
3. Attempt to create a unique view event.
4. Ignore duplicate event for the same template/session.
5. Increment the total view count only if a new view was created.
6. Return the resulting count and whether a new view was recorded.

Conceptual response:

```json
{
  "view_recorded": true,
  "views": 4830
}
```

For a duplicate:

```json
{
  "view_recorded": false,
  "views": 4830
}
```

The exact implementation should follow the project's current Supabase conventions.

---

# 9. SECURITY REQUIREMENTS

Security is important.

Do not expose any privileged Supabase credentials to the browser.

Never put:

```text
SUPABASE_SERVICE_ROLE_KEY
```

in frontend code.

Never expose a service-role key through:

```text
VITE_*
NEXT_PUBLIC_*
PUBLIC_*
```

or equivalent client-side variables.

If a service-role operation is required, it must remain server-side.

---

# 10. RLS / DATABASE ACCESS

Inspect the existing RLS configuration.

The final implementation must follow least-privilege principles.

Anonymous users should be able to record a legitimate template view through the intended controlled mechanism without receiving unrestricted write access to the templates table.

For example, do NOT simply make the entire templates table publicly writable.

Avoid policies equivalent to:

```sql
UPDATE templates
USING (true)
```

for anonymous users.

The user should only be able to invoke the intended view-recording operation.

---

# 11. ABUSE RESISTANCE

A client-controlled session ID is not a perfect anti-fraud mechanism.

A technically sophisticated user could generate many session IDs.

Therefore:

- Do not claim this system provides perfect fraud prevention.
- Do provide sensible duplicate protection.
- Keep the database authoritative.
- Add basic validation for session IDs.
- Prevent obviously malformed requests.
- Follow any existing application rate-limiting architecture.

If UI HUB already has an API/Edge Function rate-limiter, integrate with it.

If there is no rate-limiting infrastructure, do not build a giant separate system for this task unless the existing architecture makes it easy.

A future advanced analytics system can introduce stronger bot/fraud detection.

---

# 12. AUTHENTICATED USERS

UI HUB supports user accounts.

The implementation should work for:

### Anonymous user

```text
user_id = null
session_id = generated browser session ID
```

### Logged-in user

```text
user_id = authenticated user's ID
session_id = browser session ID
```

Do not make authentication mandatory for counting views.

The template should still record views for users who are not logged in.

---

# 13. WHEN TO TRIGGER THE VIEW

Trigger the view tracking from the **template detail page**, not from the template card.

The preferred lifecycle is:

```text
Template detail page mounts
        ↓
Template exists and has loaded
        ↓
Generate/retrieve session ID
        ↓
Record view
```

Make sure the event is not fired multiple times because of:

- React Strict Mode.
- Component re-renders.
- State updates.
- Dependency changes.
- Navigation transitions.
- Development-mode behavior.

For React, carefully design the effect/dependency structure so the view operation is logically triggered only once per template/session.

---

# 14. IMPORTANT: STRICT MODE

React development mode can cause effects to execute more than once.

Do not assume:

```javascript
useEffect(() => {
   recordView();
}, []);
```

automatically guarantees exactly one network/database call in all circumstances.

Use the database uniqueness rule as the true safety mechanism, and where useful also prevent unnecessary duplicate client calls.

The system must remain correct even if the request is accidentally sent twice.

The database must still count only one view.

---

# 15. TEMPLATE LIST PAGE

The Templates listing page should consume the real database-backed count.

Replace temporary logic such as:

```javascript
Math.random()
```

or hardcoded values such as:

```javascript
3.9
4.8
4.2
```

where those values are being used as fake view counts.

The card should display the actual template view count.

Example:

```text
👁 4.83k
```

The existing visual design must remain consistent.

Do not redesign the entire card.

---

# 16. NUMBER FORMATTING

Create/reuse a utility for formatting view counts.

Expected behavior:

```text
0        → 0
12       → 12
999      → 999
1000     → 1k
1200     → 1.2k
3912     → 3.9k
4829     → 4.8k
10000    → 10k
125000   → 125k
1000000  → 1M
```

Match the existing UI HUB typography and formatting style.

Do not display excessive decimal places.

Avoid:

```text
4.829000k
```

Prefer:

```text
4.8k
```

---

# 17. DETAIL PAGE VIEW DISPLAY

If the template detail page already displays a view count, update it to use the same real data source.

There should be only one source of truth.

Do not have:

```text
Templates card → fake count
Template detail → database count
```

Both should use the same persisted value.

---

# 18. REAL-TIME UI UPDATE

After the user opens a template and the database records a new view, update the displayed count appropriately.

Example:

Before:

```text
👁 4.8k
```

After a new view:

```text
👁 4.8k
```

The number may visually remain `4.8k` because of rounding.

The underlying value should still have changed:

```text
4829 → 4830
```

If the exact number is displayed:

```text
4829 → 4830
```

Do not fake an animation or increment in the UI unless the database operation succeeded.

---

# 19. ERROR HANDLING

View tracking must never break the template page.

If recording the view fails:

```text
Template still loads normally.
```

Do not show a blocking error such as:

```text
Failed to load template because view tracking failed.
```

Instead:

```text
Template content → continue working
View tracking → fail gracefully
```

Log useful information for debugging without leaking secrets.

---

# 20. LOADING BEHAVIOR

Do not block the main template rendering while waiting for the view count event.

The preferred behavior:

```text
Template loads
    ↓
User can see/use template
    ↓
View tracking runs asynchronously
```

Do not make view tracking a critical dependency for loading the template.

---

# 21. EXISTING TEMPLATE DATA

Before implementing the migration, determine where the current displayed numbers come from.

Possible cases:

### Case A — Already real database values

Preserve them.

### Case B — Hardcoded placeholder values

Do NOT silently claim these numbers are real.

Determine whether they are intentionally seeded values or temporary demo values.

If they are confirmed fake placeholders, the new database field/event system should establish the real starting point.

Do not invent historical views.

Do not fabricate analytics.

If a migration is needed, make the initial state explicit and documented.

---

# 22. DATABASE MIGRATION

Create a proper migration following the project's existing migration conventions.

The migration should:

- Create the required view/event table if needed.
- Add appropriate foreign keys.
- Add the unique constraint.
- Add indexes needed for efficient counting/querying.
- Add/update the view-count column only if required.
- Create the RPC/database function if using RPC.
- Configure appropriate security/RLS.
- Avoid destructive changes.
- Be reproducible on a fresh database.

Do not manually edit production data without a migration or clearly documented SQL.

---

# 23. PERFORMANCE

The Templates page can contain many cards.

Do NOT execute:

```text
1 query per template card
```

For example, avoid:

```text
Template 1 → SELECT views
Template 2 → SELECT views
Template 3 → SELECT views
...
Template 30 → SELECT views
```

This creates an N+1 query problem.

The list page should retrieve view counts together with the template data using the most efficient existing query/schema approach.

Examples include:

```text
templates.views
```

or:

```text
aggregate view counts in one query
```

depending on the existing architecture.

---

# 24. INDEXING

If using an event table, create indexes appropriate to actual query patterns.

At minimum consider:

```text
(template_id, session_id)
```

for uniqueness/deduplication.

Also consider:

```text
template_id
```

for analytics/count retrieval.

Do not create unnecessary indexes.

---

# 25. ANALYTICS-FRIENDLY DESIGN

Design the feature so UI HUB can later support:

```text
Views today
Views this week
Views this month
Trending templates
Most viewed templates
Views by category
Views by date
```

Therefore, preserve:

```text
created_at
template_id
```

in the event data.

Do not only store a number and throw away the event information if an event table is practical in the existing architecture.

---

# 26. FUTURE "TRENDING" SUPPORT

Do not implement full trending logic in this task unless it already exists.

However, the schema should make future queries possible, for example:

```text
Most viewed templates in last 7 days
```

This is one reason to retain individual view events.

---

# 27. TEMPLATE IDENTIFICATION

Use the existing canonical template identifier.

Do not identify templates using:

```text
template name
```

if the application already has:

```text
template_id
```

or:

```text
slug
```

Prefer the stable primary key for database relationships.

The agent should inspect the current implementation and choose the canonical identifier already used by the project.

---

# 28. CLIENT SESSION ID

Create a small reusable utility/service for the session identifier.

Conceptual behavior:

```typescript
function getViewSessionId(): string {
  // Get existing session ID
  // If missing, create UUID
  // Store it in sessionStorage
  // Return it
}
```

Use a namespaced key such as:

```text
uihub_view_session_id
```

Avoid generic keys like:

```text
session
```

that could conflict with unrelated application code.

---

# 29. PRIVACY

Do not collect unnecessary personal data.

For anonymous view tracking, the basic information should be enough:

```text
template_id
session_id
timestamp
optional authenticated user ID
```

Do not introduce:

```text
phone number
email
full IP address
precise location
```

unless already required and legitimately handled by an existing analytics/privacy system.

---

# 30. BOT / CRAWLER CONSIDERATION

Search engine crawlers and automated bots may access template URLs.

Do not build a complicated crawler-detection system during this task.

However:

- The view system should not be triggered merely by template cards being indexed/rendered.
- Do not intentionally manufacture views through SEO crawlers.
- Keep the architecture extensible for future bot filtering.

---

# 31. UI DETAILS

The existing Templates page design in the supplied screenshot should remain visually consistent.

Current card structure approximately contains:

```text
Template preview
Template title
Eye icon
View count
```

Keep:

```text
👁 3.9k
```

style rather than introducing a large new analytics element.

Only change the source of the number.

The feature should feel native to UI HUB.

---

# 32. ACCESSIBILITY

Make sure the eye icon is accessible.

For example:

```html
<span aria-label="3,912 views">
```

or an equivalent accessible implementation consistent with the existing UI.

Do not rely exclusively on the icon to communicate the meaning.

---

# 33. TYPESCRIPT

The feature must be fully typed.

Add appropriate types for:

```text
Template
TemplateView
RecordTemplateViewResponse
```

or integrate into existing types.

Avoid:

```typescript
any
```

unless there is a legitimate unavoidable reason.

---

# 34. TESTING REQUIREMENTS

Add/update tests following existing UI HUB testing conventions.

At minimum test:

### Unit tests

Session ID:

```text
No session ID
→ creates ID
```

```text
Existing session ID
→ reuses same ID
```

View formatting:

```text
0
12
999
1000
3912
4829
1000000
```

### Database/API tests

Test:

```text
First view
→ creates event
→ increments count
```

Duplicate:

```text
Same template + same session
→ does not create second event
→ does not increment count
```

Different template:

```text
Different template + same session
→ new event
→ increment
```

Different session:

```text
Same template + different session
→ new event
→ increment
```

Authenticated user:

```text
logged-in user
→ event contains user_id where appropriate
```

Anonymous user:

```text
anonymous user
→ event still works
```

Invalid input:

```text
invalid template ID
invalid session ID
→ safely rejected
```

Failure case:

```text
tracking request fails
→ template still renders
```

---

# 35. REACT / FRONTEND TEST

Specifically verify that development-mode behavior does not produce inflated counts.

Test or reason through:

```text
React Strict Mode
Component mount
Component re-render
Route parameter change
Back/forward navigation
```

The database constraint must guarantee correctness.

---

# 36. END-TO-END TEST

Create an end-to-end flow where practical:

```text
Open Templates
↓
Open template
↓
Verify view event/count
↓
Refresh
↓
Verify no duplicate increment
```

Then:

```text
Open another template
↓
Verify second template count increments
```

---

# 37. CACHE / STALE DATA

Inspect whether UI HUB uses:

```text
React Query
SWR
server caching
Next.js caching
custom caching
```

or another data layer.

Make sure the new view count does not become permanently stale because of aggressive caching.

Do not disable caching across the entire application.

Only invalidate/refetch the relevant template data where required.

---

# 38. PRODUCTION DEPLOYMENT

The implementation must work in production.

Before considering the task complete, verify:

```text
Local development
✓

Production build
✓

TypeScript
✓

Lint
✓

Tests
✓

Supabase migration
✓

Template listing
✓

Template detail page
✓

Anonymous view
✓

Duplicate protection
✓
```

Do not consider the feature complete merely because the local UI appears correct.

---

# 39. ENVIRONMENT VARIABLES

Inspect current environment configuration.

Do not introduce unnecessary environment variables.

Never expose privileged secrets to the frontend.

Use the existing public Supabase configuration for normal client operations.

If a server-side function requires privileged credentials, use the existing secure server environment convention.

---

# 40. IMPORTANT: DO NOT BREAK EXISTING FEATURES

While implementing this feature, do not unintentionally modify:

- Template design.
- Template filtering.
- Template search.
- Template categories.
- Pagination/infinite scrolling.
- Template preview.
- Authentication.
- Likes.
- Favorites.
- Pricing.
- PRO features.
- MCP functionality.
- Existing analytics.
- Existing SEO/AEO/GEO implementation.

Only modify related code when necessary to integrate real view tracking.

---

# 41. FILE/ARCHITECTURE DISCIPLINE

Before creating new files:

1. Search for existing utilities.
2. Search for existing Supabase helpers.
3. Search for existing template service code.
4. Search for existing analytics/event functionality.
5. Reuse existing abstractions where possible.

Do not create:

```text
supabase2.ts
analytics2.ts
templateService2.ts
```

or duplicate functionality.

Keep the final implementation clean and maintainable.

---

# 42. OBSERVABILITY

Add useful debugging information where appropriate.

For example:

```text
View recorded successfully
Duplicate view ignored
View tracking failed
```

Do not log:

- Supabase secret keys.
- Auth tokens.
- Sensitive user information.
- Full personal data.

Prefer production-safe structured logging consistent with the existing application.

---

# 43. FINAL USER EXPERIENCE

The final behavior should look like this:

```text
                  UI HUB
                    │
                    ▼
             Templates Page
                    │
                    │
            User clicks template
                    │
                    ▼
             Template Detail
                    │
                    ▼
          Get browser session ID
                    │
                    ▼
         Record template view
                    │
                    ▼
                Supabase
                    │
          ┌─────────┴─────────┐
          │                   │
     New session/view      Duplicate
          │                   │
          ▼                   ▼
       +1 view             +0 view
          │                   │
          └─────────┬─────────┘
                    ▼
              Real count
                    │
                    ▼
              UI HUB displays
                👁 4.8k
```

---

# 44. ACCEPTANCE CRITERIA

The task is complete only when all of the following are true:

### Database

- [ ] Template views persist in Supabase.
- [ ] Each view references the correct template.
- [ ] Anonymous users can generate views.
- [ ] Logged-in users can generate views.
- [ ] Duplicate template/session views are prevented at database level.
- [ ] View count increment is atomic.
- [ ] Appropriate indexes exist.
- [ ] RLS/security is correctly configured.
- [ ] No service-role secret is exposed client-side.

### Frontend

- [ ] Template detail page records the view.
- [ ] Templates listing displays real database-backed counts.
- [ ] Existing fake/random/hardcoded view count logic is removed where applicable.
- [ ] Refreshing the same template does not repeatedly increment the count in the same session.
- [ ] Opening another template records another view.
- [ ] View tracking does not block template rendering.
- [ ] Tracking failures do not break the page.

### Quality

- [ ] TypeScript passes.
- [ ] Lint passes.
- [ ] Existing tests continue passing.
- [ ] New tests cover view tracking.
- [ ] Production build succeeds.
- [ ] No unrelated UI regressions.
- [ ] Code follows existing UI HUB architecture.

---

# 45. IMPORTANT IMPLEMENTATION RULE

Do not immediately start writing code.

First perform:

```text
DISCOVERY
→ existing template architecture
→ existing Supabase architecture
→ existing database schema
→ existing routing
→ existing auth
→ existing analytics
→ existing tests
```

Then produce a short internal implementation assessment.

After that:

```text
DATABASE
→ migration/schema/RLS/function

BACKEND
→ view recording logic

FRONTEND
→ session ID
→ template detail tracking
→ real count display

TESTING
→ unit
→ integration
→ E2E where applicable

VALIDATION
→ typecheck
→ lint
→ build
→ tests
```

---

# 46. DO NOT MAKE THESE MISTAKES

Never implement view counting using only:

```javascript
setViews(views + 1)
```

Never rely only on:

```javascript
localStorage
```

for database integrity.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the frontend.

Never allow anonymous users to directly update arbitrary template rows.

Never count template-card impressions as views.

Never count every refresh as a new view.

Never create one database query per template card.

Never fabricate historical view numbers.

Never redesign the Templates page unnecessarily.

Never remove existing UI HUB functionality just to implement this feature.

---

# 47. FINAL DELIVERABLE / REPORT

After implementation, provide a concise engineering report containing:

## A. What changed

List the files/components/migrations changed.

## B. Database architecture

Explain:

```text
tables
indexes
constraints
RLS
RPC/functions
```

## C. View-count flow

Explain the complete:

```text
user → frontend → backend/database → count → UI
```

flow.

## D. Duplicate protection

Explain exactly how the system prevents:

```text
refresh spam
React double execution
duplicate requests
```

from inflating the count.

## E. Security

Explain:

```text
RLS
privileged credentials
anonymous access
validation
```

## F. Testing

Report:

```text
TypeScript: PASS/FAIL
Lint: PASS/FAIL
Unit tests: PASS/FAIL
Integration tests: PASS/FAIL
Build: PASS/FAIL
```

Include the exact failing error if anything fails.

## G. Production readiness

State clearly whether the implementation is:

```text
READY
```

or:

```text
NOT READY
```

Do not claim success unless the relevant checks actually passed.

---

# 48. SUCCESS CRITERIA

The final UI HUB experience should behave like a real production platform:

```text
Template has 4,829 views
        ↓
Visitor opens it
        ↓
Database records unique view
        ↓
Count becomes 4,830
        ↓
Templates page eventually displays 4.8k
        ↓
Same visitor refreshes
        ↓
Count remains 4,830
```

This is the required outcome.

Implement the feature using the **existing UI HUB architecture**, with minimal unnecessary changes, strong database integrity, graceful frontend behavior, and production-ready security.