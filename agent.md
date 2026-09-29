# Task: Fix WebM Similar Template Selection and Live Preview Loading

## Objective

Improve the template detail page so that **WebM files used by Similar Templates do not become the main preview when a user clicks them**.

The current UI has:

* A **Similar Templates** section on the left side.
* Some template cards use **WebM files** as their visual previews.
* When a user selects one of these templates, the application may attempt to use the WebM file as the main preview, which can cause unnecessary loading delays.
* The main preview area is located on the **right side**.

The required behavior is:

> **WebM = thumbnail/visual representation only.
> Actual template/live preview = content displayed in the right-side preview area.**

---

# Requirements

## 1. Make Similar Template Cards Fully Clickable

In the **Similar Templates** section on the left:

* Make the complete template card clickable.
* The user should be able to click:

  * WebM thumbnail
  * Template image/thumbnail
  * Template title
  * Card area
* Do not require the user to click a small button.
* Preserve the existing card design and styling.
* Preserve the current hover effects and animations unless they interfere with usability.

The click should identify the selected template using its existing template ID/slug/object.

Do **not** create a second independent template-selection system if one already exists.

Reuse the application's existing selection/navigation/state logic wherever possible.

---

# 2. Do NOT Use WebM as the Main Preview

This is the most important requirement.

When the selected Similar Template contains a `.webm` preview:

### DO NOT:

* Open the WebM as the main preview.
* Set the WebM URL as the right-side preview source.
* Render the WebM as the main preview video.
* Automatically play the WebM inside the main preview.
* Download/load the complete WebM unnecessarily just to display the selected template.
* Replace the live preview with the WebM animation.

### Instead:

Use the WebM **only as a visual thumbnail for the left-side Similar Template card**.

The WebM should never become the actual content of the main preview area.

---

# 3. Load the Actual Template Preview on the Right

When the user clicks a Similar Template:

1. Detect the selected template.
2. Retrieve its existing live-preview information.
3. Load the **actual template preview** into the right-side preview area.
4. Render the template itself rather than rendering the WebM file.

Example flow:

```text
User clicks WebM card
        ↓
Identify selected template
        ↓
Get template ID / slug
        ↓
Find existing live preview URL/component
        ↓
Load actual template
        ↓
Display template on RIGHT side
```

The WebM should only represent the template visually on the left.

---

# 4. Preserve the Existing Main Preview System

Before changing anything, inspect how the current right-side preview works.

Find the existing implementation responsible for:

* Template selection
* Preview rendering
* Live preview URL
* iframe rendering
* Dynamic template rendering
* Template route/navigation
* Preview component
* Template metadata

Reuse the existing implementation instead of creating an entirely new preview architecture.

Do not replace working preview functionality unnecessarily.

The goal is to **fix the selection behavior**, not rewrite the entire template preview system.

---

# 5. Support Different Preview Types

The solution should work regardless of whether the Similar Template thumbnail is:

* `.webm`
* `.mp4`
* `.png`
* `.jpg`
* `.jpeg`
* `.webp`
* Static image
* Other existing thumbnail format

The thumbnail format should **not determine the main preview format**.

For example:

```ts
thumbnailUrl = template.previewWebm
livePreviewUrl = template.livePreviewUrl
```

Then:

```text
LEFT SIDE:
template.previewWebm
        ↓
visual thumbnail only

RIGHT SIDE:
template.livePreviewUrl
        ↓
actual live template preview
```

---

# 6. Add Proper Template Data Separation

Make sure the application clearly separates:

### Thumbnail / Preview Media

Used for Similar Template cards:

```ts
thumbnailUrl
previewImage
previewWebm
previewVideo
```

### Actual Live Preview

Used in the right-side preview:

```ts
livePreviewUrl
demoUrl
previewUrl
templateUrl
route
component
```

Use whichever field names already exist in the project.

**Do not invent duplicate data fields if equivalent fields already exist.**

The important architectural rule is:

```text
thumbnail media ≠ live preview
```

---

# 7. Loading Behavior

When the user clicks a Similar Template:

* Show a lightweight loading state in the right-side preview if needed.
* Do not block the entire page.
* Do not reload unrelated page sections.
* Do not reload all Similar Templates.
* Do not download every WebM file on click.
* Only load the selected template's actual live preview.

If the live preview requires an iframe or external URL, load only that resource.

Example:

```tsx
{selectedTemplate && (
  <LivePreview
    template={selectedTemplate}
  />
)}
```

Avoid:

```tsx
<video src={selectedTemplate.previewWebm} />
```

inside the main preview area.

---

# 8. WebM Thumbnail Optimization

WebM files may be relatively expensive compared with static thumbnails.

Keep WebM usage limited to the Similar Templates cards.

Where possible:

* Lazy-load WebM thumbnails.
* Do not load every WebM simultaneously if the existing implementation already supports lazy loading.
* Avoid autoplaying large WebM files unnecessarily.
* Use the existing poster/thumbnail mechanism where available.
* Do not change the current visual appearance unless necessary.

However, **do not aggressively rewrite the media pipeline** if the current implementation is already working.

Make the smallest safe change required.

---

# 9. Selected Card State

When a user clicks a Similar Template:

* Clearly indicate which template is selected.
* Preserve the existing selected/active-card UI if one already exists.
* The selected template should remain identifiable while its live preview loads.

Example states:

```text
Normal card
↓
Hover card
↓
Selected card
↓
Right-side live preview loading
↓
Right-side live preview displayed
```

Do not introduce a visually inconsistent new design.

---

# 10. Navigation / URL Behavior

Inspect the existing routing behavior before implementing the change.

If clicking a Similar Template currently updates the route, preserve that behavior.

If the application uses something like:

```text
/templates/{slug}
```

continue using the same routing structure.

Do not break:

* Browser back button
* Browser forward button
* Direct template URLs
* Page refresh
* Deep linking
* Existing template navigation

If the current page can change its selected template without full navigation, preserve that behavior instead.

---

# 11. Prevent WebM From Accidentally Becoming the Main Preview

Add a clear media-type guard.

For example, conceptually:

```ts
const isVideoThumbnail = thumbnailUrl?.endsWith(".webm");

if (isVideoThumbnail) {
    // Use WebM only for the Similar Template card.
    // Main preview must use livePreviewUrl.
}
```

But do not blindly rely on `.endsWith(".webm")` if the application already has metadata indicating the media type.

Prefer the application's existing template metadata/type system.

The final preview selection should follow logic similar to:

```ts
const previewSource =
  template.livePreviewUrl ||
  template.demoUrl ||
  template.route ||
  template.previewComponent;
```

and **never automatically fall back to the WebM thumbnail just because it exists**.

If no live preview is available, use the application's existing fallback behavior rather than displaying the WebM as the main preview.

---

# 12. Error Handling

If the selected template's live preview fails:

* Show an existing/error-safe fallback UI.
* Provide a useful loading/error state.
* Do not fall back to rendering the WebM video as the main preview.
* Do not crash the page.

Example:

```text
Unable to load live preview.
Please try again.
```

Use the application's existing error UI/style where possible.

---

# 13. Preserve Existing Functionality

This change must NOT break:

* Template search
* Similar Template ranking
* Template cards
* Template downloads
* Live Link button
* CLI button
* Preview / code toggle
* Fullscreen preview
* Refresh preview
* Breadcrumb navigation
* Routing
* Authentication
* Existing animations
* Existing responsive behavior
* Existing API calls
* Existing template metadata
* Existing WebM thumbnails

Do not modify unrelated components.

---

# 14. Implementation Strategy

Before modifying code:

### Step 1 — Find the Similar Templates component

Locate the component responsible for:

```text
Similar Templates
Top 5 of 16 ranked by relevance
```

Identify:

* Card component
* Thumbnail renderer
* Click handler
* Template data structure

### Step 2 — Find the main preview component

Locate the component responsible for:

```text
Preview
```

on the right side.

Determine how it receives:

* template data
* URL
* slug
* selected template
* live preview source

### Step 3 — Trace the existing template-selection flow

Determine:

```text
click card
    ↓
selected template
    ↓
route/state
    ↓
preview
```

Reuse this flow.

### Step 4 — Separate thumbnail and preview sources

Ensure the WebM source is used only for the left-side card.

The actual preview source must come from the template's existing live-preview mechanism.

### Step 5 — Add the smallest necessary change

Avoid large refactors.

Change only what is required to achieve the new behavior safely.

---

# 15. Required Final UX

The finished interaction should work like this:

```text
┌──────────────────────┬────────────────────────────────────────┐
│ Similar Templates    │                                        │
│                      │                                        │
│ [WebM Thumbnail]     │                                        │
│ Template A           │          ACTUAL LIVE PREVIEW            │
│                      │                                        │
│ [WebM Thumbnail] ←── │          of selected template           │
│ Template B           │                                        │
│                      │                                        │
│ [Image Thumbnail]    │                                        │
│ Template C           │                                        │
│                      │                                        │
└──────────────────────┴────────────────────────────────────────┘
```

When clicking Template B:

```text
WebM thumbnail remains on LEFT
             +
actual Template B preview appears on RIGHT
             +
WebM is NOT shown on RIGHT
```

---

# 16. Important Constraint: No Breaking Changes

Follow these rules strictly:

* Do not rewrite the complete page.
* Do not redesign the UI.
* Do not remove existing features.
* Do not change the database schema unless absolutely required.
* Do not change unrelated APIs.
* Do not replace the existing preview engine without a strong technical reason.
* Do not rename existing public interfaces unnecessarily.
* Do not remove existing WebM assets.
* Do not change template ranking logic.
* Do not change the current Similar Templates visual design.

Use the smallest maintainable implementation.

---

# 17. Test Cases

After implementation, test all of the following.

### Test 1 — WebM Similar Template

Click a Similar Template whose thumbnail is WebM.

Expected:

```text
LEFT:
WebM thumbnail remains visible

RIGHT:
Actual live template preview loads

NOT:
WebM video as the right-side preview
```

### Test 2 — Image Similar Template

Click a Similar Template using PNG/JPG/WebP.

Expected:

```text
Actual live template preview loads on the right.
```

### Test 3 — Multiple WebM Templates

Click WebM Template A → Preview A.

Click WebM Template B → Preview B.

Click WebM Template C → Preview C.

Ensure the correct live preview appears every time.

### Test 4 — Rapid Clicking

Rapidly click:

```text
Template A
Template B
Template C
```

Ensure the preview does not display the wrong template because of stale asynchronous loading.

Handle race conditions safely.

### Test 5 — Missing Live Preview

If a template does not have a valid live preview source:

```text
Show safe fallback/error state.
Do NOT display WebM as the main preview.
```

### Test 6 — Existing Controls

Verify that:

* Preview button still works.
* Code button still works.
* Fullscreen still works.
* Refresh still works.
* Live Link still works.
* CLI still works.

### Test 7 — Responsive UI

Check desktop and mobile/tablet layouts.

The Similar Templates section must remain usable and clickable.

---

# 18. Acceptance Criteria

The task is complete only when all of these are true:

* [ ] Similar Template cards are clickable.
* [ ] WebM thumbnails remain available for visual representation.
* [ ] Clicking a WebM thumbnail does not open/render the WebM as the main preview.
* [ ] Clicking a Similar Template updates the right-side preview.
* [ ] The right-side preview displays the actual template content/live preview.
* [ ] Only the necessary live-preview resource is loaded.
* [ ] Existing navigation and template functionality continue working.
* [ ] No unrelated UI is redesigned.
* [ ] No existing features are removed.
* [ ] No console errors are introduced.
* [ ] No broken routes are introduced.
* [ ] Existing image-based templates continue working.
* [ ] Multiple WebM templates can be selected correctly.
* [ ] Missing/failed live previews have a safe fallback.
* [ ] The implementation is clean, maintainable, and uses the existing architecture wherever possible.

---

# Final Instruction to the Coding Agent

First inspect the existing codebase and identify the exact components and data flow responsible for:

1. Similar Template cards
2. WebM thumbnail rendering
3. Template selection
4. Right-side preview rendering
5. Live preview URLs/components
6. Routing/state management

Then implement the **minimum safe change** needed to separate WebM thumbnail media from the actual live preview.

The core rule is:

**WebM is only for the Similar Templates thumbnail.
The selected template's real/live content must be rendered in the right-side preview.**

Do not break existing functionality, styling, routing, APIs, or preview controls.

After making the changes, run the relevant checks/build/tests and report:

* Files changed
* What was changed
* Why it fixes the WebM loading problem
* How WebM thumbnails are handled now
* How the actual live preview is selected
* Test/build results
* Any remaining limitation
