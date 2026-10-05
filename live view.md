# UI HUB — Implement Real Component View Counter

I want to add the same real view-count system to the **Components section** of UI HUB.

Example component page:

`/components/button/payment-transaction`

Currently the component detail page shows:

`👁 — views`

I want this to become a **real, persistent view count stored in Supabase**.

## Main Requirement

When a user actually opens/views a component detail page:

```text
User opens component page
        ↓
Component successfully loads
        ↓
Record ONE real view
        ↓
Supabase
        ↓
Component view count increases
```

The count shown in the UI must come from the real database.

### VERY IMPORTANT

Do **NOT** create fake views.

Do NOT use:

- `Math.random()`
- hardcoded counts
- generated/random starting numbers
- frontend-only counters
- artificial increments
- fake seed analytics
- fake "popular" numbers

If a component has never been viewed, its real count must be:

`0`

Example:

```text
New Component
👁 0 views
```

After one valid visitor opens it:

```text
👁 1 view
```

After another valid unique session opens it:

```text
👁 2 views
```

The database must be the source of truth.

---

# 1. FIRST INSPECT THE EXISTING TEMPLATE VIEW SYSTEM

Before implementing anything, inspect the real view-count system already implemented for **Templates**.

Find:

- view table/schema
- database function/RPC
- API route or service
- session ID logic
- duplicate protection
- RLS policies
- view-count query
- formatting utility
- frontend tracking hook/function

### IMPORTANT

Do NOT create a completely separate view-count architecture for Components if the existing Template system can be reused.

Prefer extending/generalizing the current architecture.

For example, if the existing system can support:

```text
content_type
content_id
session_id
created_at
```

extend it properly.

If the current system is template-specific and cannot safely support Components, create the minimum necessary extension while keeping the architecture consistent.

Avoid duplicate systems such as:

```text
templateViews.ts
componentViews.ts
templateAnalytics.ts
componentAnalytics.ts
```

when a reusable implementation is possible.

---

# 2. WHAT COUNTS AS A COMPONENT VIEW?

A component view should be recorded only when the user actually opens the **component detail page**.

For example:

```text
/components
```

shows 141 components.

This does NOT create 141 views.

Scrolling through the Components page does NOT create a view.

Rendering component cards does NOT create a view.

Hovering over a component does NOT create a view.

Loading a preview image does NOT create a view.

Search results appearing does NOT create a view.

Only:

```text
User opens:

/components/button/payment-transaction

        ↓

Component detail page loads successfully

        ↓

Record view
```

---

# 3. COMPONENT LIST PAGE

The Components listing/sidebar/card UI must use real database counts.

If a component currently displays:

```text
👁 — views
```

replace it with the actual count.

Examples:

```text
👁 0
👁 1
👁 25
👁 1.2k
👁 4.8k
```

Do not change the existing visual design unnecessarily.

Keep the current UI HUB design, typography, spacing, icons, and layout.

Only replace the fake/placeholder source with real data.

---

# 4. COMPONENT DETAIL PAGE

On a component detail page such as:

```text
/components/button/payment-transaction
```

record the view after the component has been successfully identified/loaded.

Recommended flow:

```text
Route loads
   ↓
Read component slug/id
   ↓
Find component
   ↓
Verify component exists
   ↓
Render component page
   ↓
Get current browser session ID
   ↓
Record view
```

Do not attempt to record a view for an invalid/nonexistent component.

---

# 5. DUPLICATE VIEW PROTECTION

Do not increment the database every time the page refreshes.

Use the same session-based duplicate protection as the Template View system.

Desired behavior:

```text
Session A
    ↓
Open Payment Transaction
    ↓
+1 view

Refresh Payment Transaction
    ↓
+0

Navigate away and return during same session
    ↓
+0
```

Then:

```text
Session B
    ↓
Open Payment Transaction
    ↓
+1
```

For a different component:

```text
Session A
    ↓
Open Payment Transaction
    ↓
+1

Open Magic Card Effect
    ↓
+1
```

So the uniqueness should conceptually be:

```text
component_id + session_id
```

---

# 6. DATABASE MUST BE THE FINAL PROTECTION

Frontend logic alone is NOT enough.

Even if the frontend accidentally sends the request twice, the database must prevent duplicate counting.

Use a database-level unique constraint/index or equivalent mechanism:

```text
UNIQUE(component_id, session_id)
```

or, if using a generalized content-view table:

```text
UNIQUE(content_type, content_id, session_id)
```

The exact implementation must match the existing UI HUB schema.

---

# 7. ATOMIC VIEW RECORDING

The operation must be atomic.

Conceptually:

```text
Attempt to insert view event
        ↓
Was it new?
   /            \
 YES            NO
 ↓              ↓
+1 view        +0
```

Do NOT perform unsafe frontend logic such as:

```javascript
views = views + 1
```

followed by a direct update.

The trusted database/server operation must determine whether the view is new.

---

# 8. SESSION ID

Reuse the existing Template session-ID implementation.

Do not create another unrelated session system.

The session identifier should be generated once per browser session and reused.

Conceptually:

```text
uihub_view_session_id
```

Use the same mechanism already used by Templates unless there is a strong architectural reason not to.

---

# 9. AUTHENTICATED + ANONYMOUS USERS

Both must be supported.

Anonymous visitor:

```text
user_id = null
session_id = valid session ID
```

Logged-in visitor:

```text
user_id = authenticated user ID
session_id = valid session ID
```

Do not require login just to count a component view.

---

# 10. NO FAKE INITIAL COUNTS

This requirement is critical.

Do not convert:

```text
0
```

into:

```text
1.4k
3.7k
12.5k
```

just to make UI HUB look popular.

Do not seed artificial historical views.

Do not generate random values.

Do not add fake "base views".

Real analytics must start from real events.

If existing components already contain fake/hardcoded view numbers, identify them and remove/replace them with the real database value.

---

# 11. EXISTING COMPONENT IDENTIFICATION

Inspect how UI HUB identifies Components.

It may use:

```text
component_id
slug
category
component key
database ID
registry ID
```

Use the application's canonical stable identifier.

Do NOT use the component display name as the database primary relationship if a stable ID already exists.

For example:

```text
Payment Transaction
```

should not be the primary identifier if the component already has:

```text
payment-transaction
```

or a database UUID.

Use the existing architecture.

---

# 12. SUPABASE SECURITY

Follow the same security model already implemented for Templates.

Do NOT expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to client-side code.

Never place privileged secrets in:

```text
VITE_*
NEXT_PUBLIC_*
```

or equivalent public environment variables.

Anonymous users must not receive unrestricted permission to modify component rows.

Use the existing RPC/API/server-side mechanism for recording views.

---

# 13. RLS

Inspect existing Row Level Security policies.

The final architecture should allow legitimate view tracking without allowing users to arbitrarily execute:

```text
UPDATE components
SET views = 999999999
```

The browser must never be able to directly manipulate the component's total view count.

The database/server controls the increment.

---

# 14. VIEW COUNTER MUST NEVER BREAK THE PAGE

This is especially important because the previous Template implementation caused a blank screen.

The new component view tracking must be isolated from the component page rendering.

If the view request fails:

```text
Component page still loads.
Component preview still works.
Code tab still works.
Vibe Prompt still works.
Fullscreen still works.
Sidebar still works.
```

A failed analytics/view request must NOT produce:

```text
blank screen
white screen
black screen
runtime crash
component rendering failure
```

The view tracker should fail gracefully.

---

# 15. REACT SAFETY

Inspect React lifecycle behavior carefully.

Make sure view tracking does not execute unnecessarily because of:

- React Strict Mode
- re-rendering
- state changes
- route changes
- query changes
- component preview state
- tab switching

The database uniqueness rule must still guarantee correctness if the client accidentally sends two requests.

---

# 16. DO NOT COUNT TAB SWITCHES

The detail page contains sections such as:

```text
PREVIEW
CODE
VIBE PROMPT
```

Switching between these tabs must NOT generate additional views.

Example:

```text
Open component
→ +1

Click CODE
→ +0

Click VIBE PROMPT
→ +0

Return to PREVIEW
→ +0
```

The view belongs to the component page visit, not each UI interaction.

---

# 17. FULLSCREEN

Opening the component preview in fullscreen should NOT create another view if the user has already viewed the component.

Example:

```text
Open component
→ +1

Click FULLSCREEN
→ +0
```

---

# 18. SIDEBAR NAVIGATION

The component sidebar contains many components.

Clicking:

```text
Payment Transaction
```

should produce one view for that component.

Then clicking:

```text
Magic Card Effect
```

should produce one view for the second component.

The route change must correctly identify the newly opened component.

Make sure stale component IDs/slugs are not reused.

---

# 19. SPA ROUTING

UI HUB appears to use client-side routing.

Test navigation such as:

```text
Component A
   ↓
Component B
   ↓
Component C
```

without a full browser refresh.

Each distinct component should correctly trigger its own valid view event.

Do not rely solely on the initial application mount.

Watch for route parameter changes.

---

# 20. PERFORMANCE

Do not introduce an N+1 query problem.

If the Components page contains 100+ components, do NOT make 100 separate database calls just to display counts.

Retrieve view counts efficiently using the existing component query/data layer.

Use the existing architecture wherever possible.

---

# 21. NUMBER FORMATTING

Reuse the existing view-count formatter from Templates.

For example:

```text
0 → 0
1 → 1
25 → 25
999 → 999
1000 → 1k
1200 → 1.2k
3912 → 3.9k
4829 → 4.8k
10000 → 10k
1000000 → 1M
```

Do not create a second formatting utility if one already exists.

---

# 22. TEST THESE EXACT SCENARIOS

### Scenario 1 — First component view

```text
Initial count = 0

Open Payment Transaction

Expected:
count = 1
```

### Scenario 2 — Refresh

```text
Refresh Payment Transaction

Expected:
count remains 1
```

### Scenario 3 — Same session revisit

```text
Leave page
Return to Payment Transaction

Expected:
count remains 1
```

### Scenario 4 — Different component

```text
Open Magic Card Effect

Expected:
its count increases by 1
```

### Scenario 5 — New session

```text
New browser session
Open Payment Transaction

Expected:
count can increase by 1
```

### Scenario 6 — View tracking failure

Simulate database/API failure.

Expected:

```text
Component page still renders normally.
```

### Scenario 7 — Invalid component

Open an invalid component route.

Expected:

```text
Normal not-found/error handling.
No view event.
No runtime crash.
```

### Scenario 8 — Direct URL

Open:

```text
/components/button/payment-transaction
```

directly.

Expected:

```text
Component loads.
View records once.
```

### Scenario 9 — SPA navigation

```text
Payment Transaction
↓
Magic Card Effect
↓
Rainbow Button
```

Each component should correctly process its own view.

---

# 23. TEST FOR FAKE VIEW POSSIBILITY

Do a final audit specifically for fake views.

Search the codebase for:

```text
Math.random
random views
fake views
mock views
hardcoded views
placeholder views
base views
views + random
```

Remove or replace any implementation responsible for displaying fake component view counts.

The final number must have a clear path:

```text
REAL USER VIEW
      ↓
REAL EVENT
      ↓
SUPABASE
      ↓
REAL COUNT
      ↓
UI
```

There must NOT be a path:

```text
frontend
   ↓
fake number
   ↓
UI
```

---

# 24. USE ONE SOURCE OF TRUTH

The Components listing and Component detail page must use the same real persisted count.

Do not have:

```text
Component listing → fake count
Component detail → real count
```

Both should use the database-backed value.

---

# 25. DO NOT BREAK EXISTING UI

Do not redesign the component page shown in the screenshot.

Keep:

- Left component navigation
- Component title
- Breadcrumb
- Preview / Code / Vibe Prompt tabs
- Fullscreen button
- Favorite button
- Share button
- PRO panel
- Existing preview area
- Existing typography/layout

Only integrate the real view counter.

---

# 26. FINAL VALIDATION

Before saying the task is complete, run the available:

```text
TypeScript
Lint
Unit tests
Integration tests
Production build
```

Also manually verify:

```text
/components
/components/button/payment-transaction
```

and at least 2–3 additional component routes.

Make sure the page does NOT become blank.

---

# 27. FINAL REPORT

After implementation, report:

### Root architecture

Explain whether you:

- reused the Template view infrastructure, or
- extended it, or
- created a minimal component-specific extension.

### Database

Show:

- table/function changes
- unique constraint
- indexes
- security/RLS changes

### Frontend

Show:

- component detail integration
- session handling
- count display

### Anti-fake protection

Explain exactly why the displayed count is a real persisted value and how duplicate requests are prevented.

### Validation

Report:

```text
TypeScript: PASS/FAIL
Lint: PASS/FAIL
Tests: PASS/FAIL
Build: PASS/FAIL
Manual component test: PASS/FAIL
```

If anything fails, provide the real error. Do not claim success without actually verifying it.

---

# FINAL SUCCESS CONDITION

The final behavior must be:

```text
Components page
      ↓
User opens Payment Transaction
      ↓
Component loads successfully
      ↓
Real view event recorded
      ↓
Supabase count increases
      ↓
UI displays real count
```

Example:

```text
Before:
👁 0

First real visitor:
👁 1

Refresh:
👁 1

Same-session revisit:
👁 1

Another real session:
👁 2
```

There must be **no fake, random, hardcoded, or artificially generated view numbers**.

Implement this using the existing UI HUB architecture and reuse the Template view-count infrastructure wherever possible.