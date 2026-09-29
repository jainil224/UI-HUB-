# Build Prompt: Visionary Wellness Hero

Build a polished, responsive, single-screen landing-page hero for **Visionary**, matching the specification below as closely as possible. Treat every phrase, placement, color, and behavior here as intentional. Do not redesign, simplify, or add unrelated sections. The result should feel like the same cinematic wellness experience at desktop, tablet, and mobile sizes.

## 1. Product and Overall Art Direction

Create a premium digital wellness experience: cinematic, calm, editorial, tactile, and subtly futuristic. The screen is a near-black stage with a warm rose-pink light source, a photorealistic cupped hand rising from the bottom center, and a luminous, interactive sphere made from thousands of pink particles floating just above the palm. Text is elegant and restrained. UI panels use fine borders and translucent dark glass rather than bright solid cards.

The contrast between the dark background, pale rose sphere, realistic hand, quiet typography, and compact interface panels is the defining look. Preserve generous negative space. The central hand-and-sphere visual is the emotional focal point, while the headline remains easy to read on the left and the wellness recommendation panel remains easy to scan on the right.

Do not use a cyan or blue sphere, a blue-lit hand, a purple gradient, a generic stock wellness dashboard, a cartoon hand, or an unrelated hero illustration. Do not add a crown/VIP tile: it is not part of the visible target composition. Do not add sections below the hero, a footer, a large marketing CTA block, or decorative floating orbs.

## 2. Canvas and Layout

- Make the hero fill at least the full viewport height. On desktop, fit the complete composition into one viewport without a page-level scrollbar; on small screens, allow natural vertical scrolling if required to keep every element usable.
- Use a full-bleed background, not a framed page or a card around the entire hero.
- Use a near-black base: `#080305` for the visual stage and `#030609` where needed for the darkest page/background blend. Main text is white.
- Keep the content container centered and capped at approximately `1440px` wide. Use horizontal padding of about `24px` on narrow screens, `40px` on small/medium screens, and `56px` on large screens.
- Layer the screen in this order: ambient background; top navigation; center-bottom hand and sphere; foreground content. The foreground content sits above the hand layer but must not obscure the particle sphere.
- At desktop widths, use a three-zone visual balance: headline and supporting content in the left portion, hand and sphere centered, recommendation panel toward the lower right. The hand/sphere is absolutely centered on the horizontal axis and anchored to the bottom edge. The left column is roughly five-twelfths of the content width. Keep the right panel near the lower-right edge with comfortable viewport margins.
- At tablet/mobile widths, keep the brand and actions in the header, collapse the navigation to a menu button, center the hand/sphere, and move the recommendation panel below the headline/content in normal flow. Prevent text, menu, and card from colliding with the hand or each other.

## 3. Background and Lighting

Build a layered, restrained lighting treatment rather than a flat black fill:

1. Start with a deep obsidian/black-cherry field (`#080305`).
2. At the top center, add a short, thin, horizontal white-to-rose light bar, about `240px` wide on a small screen and up to `360px` on a desktop. The center is nearly white; the ends fade to transparent. Add a soft rose halo around it.
3. Directly beneath that bar, add a narrow, downward-facing rose spotlight beam centered over the sphere. It should fade out before reaching the page edges and feel like a studio light, not a hard geometric triangle.
4. Add a broad, soft rose ambient bloom behind the sphere in the upper-middle area and a subtler, darker rose diffusion around the lower hand/wrist area. Use large, very soft radial gradients and blur; keep the corners dark.
5. Add a barely visible fine-grain texture (around 3% opacity) and a soft dark vignette at the edges.
6. Track pointer position to move only the background lighting layer a few pixels in the opposite direction, with smooth easing. Do not make the hand drift with the pointer. Disable this parallax when reduced motion is requested.

Suggested rose colors: `#E2B4BD` as the main sphere/glow color, `#C27586` for the deeper rose, and a near-white blush (`#FFF0F3`) for highlights. The atmosphere should remain mostly dark; pink light is concentrated around the center, not spread over the entire canvas.

## 4. Header and Navigation

Place a single horizontal header near the top edge, with roughly `24px` top spacing on mobile and `24px` horizontal/vertical breathing room on desktop. Align its three zones vertically:

### Left: wordmark

- Show a small rose sparkle glyph (`✦`) followed by the word **Visionary**.
- Use white text, medium weight, approximately `16px` on mobile and `18px` on larger screens.
- Color the sparkle `#E2B4BD` and give it a subtle rose glow.
- Keep the wordmark on one line and aligned to the left edge of the content container.

### Center: desktop navigation

- Show a compact translucent glass navigation capsule centered horizontally in the header.
- Include exactly these labels, in this order: **Home**, **Service**, **Product**, **About Us**.
- Use small, approximately `12px` sans-serif text, with compact horizontal/vertical padding and a small gap between items.
- The capsule has a faint white border, very dark transparent fill, approximately `16px` backdrop blur, and a subtle inset highlight/shadow. It should not look like a large floating panel.
- **Home** is initially active: slightly brighter white text, a subtly lighter translucent background, faint border, and restrained rose-tinted shadow. Other items are muted cool-neutral gray and brighten on hover.
- Clicking an item changes the active visual state. Do not invent page routes or extra content if only this hero is implemented.

### Right: account actions

- Show **Sign in** as a quiet translucent dark button with a thin white border, white small text, and restrained hover feedback.
- Show **Join** beside it as a compact white button with dark text, a small corner radius, and a subtle white glow. It is the brightest header control.
- Use approximately `12px` text and compact vertical padding. Both buttons have visible keyboard-focus styles and a slight pressed state.
- On small screens, hide the desktop navigation and the Sign in button; keep **Join** visible and add a compact hamburger/close icon button. The icon toggles a dark, blurred dropdown containing the four same navigation items, then a divider and Sign in / Join Visionary actions. Close the dropdown after selecting a navigation item or an account action. Keep the dropdown within the viewport.

There is no crown tile or floating VIP badge in this target header.

## 5. Central Hand Image

- Use a photorealistic human hand with the palm facing upward, fingers naturally relaxed and gently cupped, as if supporting a floating sphere. The hand and forearm rise vertically from the bottom center. Show enough palm and fingers to make the gesture immediately legible; let the wrist fade into the dark bottom edge.
- Center the hand precisely. Anchor its bottom to the viewport bottom, with a maximum desktop width around `430px`; scale down smoothly on smaller screens. At desktop, the hand image should extend about `230–300px` high, depending on viewport size.
- Use the supplied original hand image if available. The reference asset used by the current implementation is `https://res.cloudinary.com/dgqd54pbl/image/upload/v1790671314/ChatGPT_Image_Sep_29_2026_02_07_08_PM_vshk0k.png`. If it cannot be loaded, use a local supplied equivalent or create/source a closely matched photorealistic cupped-hand image. Do not substitute an unrelated image.
- Preserve the image's natural proportions with `object-fit: contain` and bottom alignment. Avoid hard rectangular image edges: softly mask/fade the upper/lower transition as appropriate and blend the wrist into the background with a dark-to-transparent bottom gradient.
- Apply only a restrained brightness/contrast lift and a soft rose rim illumination/drop shadow (`rgba(226,180,189,0.35)` neighborhood). The skin should remain realistic; do not tint the whole hand pink.
- The hand remains stationary. It does not rotate, bob, or follow the pointer.

## 6. Floating Particle Sphere (The “Ball”)

Position a luminous spherical particle object directly above the open palm, centered on the same vertical axis. It should look like a dense, three-dimensional ball of glowing points, not a solid plastic ball, flat circle, wireframe, or cloudy blob.

### Shape and size

- Desktop sphere diameter: approximately `240–260px`; tablet: approximately `210–240px`; small screen: approximately `180–210px`.
- The sphere floats just above the fingertips/palm. Keep a small visible gap or luminous overlap so the light visually connects the ball and hand without hiding the fingers.
- Use thousands of individual, round, softly glowing particles distributed evenly over a true 3D spherical surface. The current target uses about `8,500` points.
- Color the lower/deeper region dusty rose (`#C27586`), the central body soft rose (`#E2B4BD`), and the upper-facing highlights pale blush/near-white (`#FFF0F3`). Vary point brightness and size slightly so the surface has depth. Keep the silhouette spherical and readable.
- Use additive/glow-like rendering, with bright pinpoint particles and soft falloff. Avoid excessive bloom that merges all points into one solid disk.

### Sphere lighting

- Put a soft rose core glow behind the sphere.
- Surround it with a subtle luminous corona ring: transparent in the center, brightest at the outer circumference, and feathered at the edge. The ring should read as light around the sphere, not a sharp outlined circle.
- Add a pale spotlight from above, fading down onto the top of the sphere.
- Add a broader, warm rose halo behind the sphere and hand. Keep all glows soft and layered.

### Motion and interaction

- Rotate the sphere continuously and slowly around its vertical axis. Motion should be smooth and steady, not fast or distracting. The target implementation uses a speed setting around `22` on its component scale.
- Keep the hand and surrounding page content stationary while the sphere rotates.
- Allow direct pointer/touch interaction with the sphere: dragging rotates it with the gesture, and rotation settles smoothly when released. Use easing/smoothing rather than snapping.
- As a pointer approaches the surface, nearby particles subtly push away from it and ease back into their original positions. A click/tap can briefly scatter nearby particles outward, then they smoothly return to the spherical surface.
- Use a moderate influence radius (about `75px` in the interaction coordinate system) and restrained force. Interaction must preserve the overall sphere silhouette.
- Keep the pointer cursor as grab/grabbing while interacting. Do not let the sphere interaction block the rest of the page.
- Respect `prefers-reduced-motion`: disable automatic rotation and background parallax, and avoid nonessential animation. Keep the sphere visible and, where practical, still permit direct user interaction.

## 7. Left-Side Hero Copy

Place the copy left aligned in a column with a maximum width around `500px`. Vertically center it in the available desktop hero area, with enough distance from the left edge and enough contrast over the background. Keep it above the visual background but do not put it inside a card.

Use this exact headline and line arrangement:

```text
Your Everyday
Wellness Partner
```

- Use **Cormorant Garamond** or a very close editorial serif, regular weight, with a refined high-contrast appearance.
- Set the first line in white. On the second line, italicize **Wellness** in a light serif weight, followed by **Partner** in the regular serif style.
- Use a desktop font size around `54px` (fluidly reduce toward `32px` on narrow screens), line-height around `1.1`, and restrained dark text shadow for legibility.
- Do not use all caps, bold sans-serif display lettering, or a gradient-filled headline.

Under the headline, show this exact supporting text:

> Stay on top of your health with a trusted partner by your side—track habits, monitor progress, and receive personalized guidance for a balanced, healthier life every day.

- Use **Plus Jakarta Sans** or a close clean sans-serif, light weight, muted light gray, approximately `13.5–14.5px`, with line-height around `1.72` and a maximum width around `400px`.
- Leave about `20px` above this paragraph. Keep the text readable and do not let it collide with the center hand/sphere.

Below the paragraph, add a subtle partner-brand row:

- Add a faint horizontal divider above the row.
- Show these five names in this exact order: **Typely**, **Framex**, **Webora**, **Logiqo**, **Designo**.
- Precede every name with a small rose `✻` symbol. Use approximately `12px` muted-gray text with modest horizontal spacing; allow a neat wrap on narrow screens.
- Keep this row visually secondary to the headline and paragraph.

The **Join** header action and an optional hero action may open the same Join flow; do not add a visually large extra CTA if it compromises the target composition.

## 8. Recommendation Card

Create one compact wellness recommendation HUD card. On desktop place it in the lower-right region, aligned near the bottom of the main content area; on mobile/tablet show it below the hero copy and center it. The card should not cover the sphere or hand.

- Width: about `210px` on a narrow layout and `230px` on a wider layout.
- Padding: about `16px`. Corner radius: about `16px`.
- Fill: translucent dark burgundy/black, near `rgba(20, 8, 12, 0.75)`. Add a fine rose border (`rgba(226,180,189,0.18)` neighborhood), approximately `20px` backdrop blur, a soft black drop shadow, and a subtle inset white top edge.
- Keep typography compact and crisp; do not enlarge the card or make it the primary focal point.

### Card header

- On the left, show a small circular rose-tinted badge with a sparkle icon, followed by **Recommendation**.
- Use small, semibold, light-gray text (about `11px`).
- On the right, show a rose-tinted count in `completed/total` form. Initial state is **1/3**.
- Add a thin, low-contrast divider below the header.

### Habit rows

Show exactly three compact, clickable rows in this order:

1. Footprints icon, rose tint; label **20 min walk**; initially incomplete with an empty circular check control.
2. Droplet icon, pale rose tint; label **Drink 600ml water**; initially complete with a rose check-circle; use subdued, crossed-out text for the completed item.
3. Moon icon, rose tint; label **Sleep before 10 PM**; initially incomplete with an empty circular check control.

Use approximately `12px` label text and small consistent icons (around `14px`). Clicking a row toggles its completion state and updates the header count. Use subtle row hover feedback and visible keyboard focus. Keep row spacing tight and even.

### Card footer

- Add a faint divider.
- On the left, show a tiny rose live-status dot and **Live Sync**.
- On the right, show **Today**.
- Use about `10px` muted text. The status dot may pulse very subtly, but do not animate the entire card.

## 9. Typography, UI Finish, and Accessibility

- Load **Cormorant Garamond** for the display headline and **Plus Jakarta Sans** for navigation, paragraph, labels, and controls when web fonts are available. Use sensible serif/sans fallbacks.
- Keep white for primary copy; use cool-neutral gray for supporting copy and warm rose only for the sphere, tiny symbols, checks, selected states, and concentrated lighting.
- Buttons and compact UI use small radii (roughly `6–10px`), except the recommendation card and circular badges. Borders should be low contrast and thin.
- Add restrained hover, pressed, and focus-visible states. Avoid dramatic button scaling, bouncy easing, or continuous motion on text and cards.
- Use semantic header, nav, main, headings, lists, and buttons. Give icon-only menu controls accessible labels. Provide meaningful alt text for the hand image. Ensure adequate contrast and keyboard operation.
- Respect reduced-motion preferences. Keep controls usable at touch sizes on mobile even though desktop visual controls are compact.

## 10. Responsive Composition

### Large desktop (about 1024px and wider)

- Keep the header in one row: wordmark left, four-link nav centered, Sign in and Join right.
- Keep the headline in the left column; keep the hand/sphere centered and anchored to the bottom; keep Recommendation near the lower-right.
- Use a hero height equal to the viewport and hide horizontal overflow. Ensure the headline does not sit directly behind the sphere.

### Tablet and narrow desktop

- Preserve the center focal visual while shrinking the sphere and hand proportionally.
- Keep headline and recommendation card legible. Move the card into a non-overlapping position when the right-side desktop placement no longer fits.
- Replace the desktop nav with the mobile menu at the chosen breakpoint; do not cram all header controls into a narrow row.

### Mobile (below about 768px)

- Show the wordmark left and Join/menu controls right. The desktop nav and Sign in button are hidden until the menu opens.
- Use a readable headline, approximately `32px` at the narrow end, and keep supporting copy within the viewport width.
- Center the hand and sphere and scale them down; do not let them obscure the headline or recommendation card. Allow vertical scrolling if the content needs it.
- Put the recommendation card below the copy, centered, with no horizontal overflow. The brand row may wrap cleanly.

## 11. Interaction and Functional Requirements

- Desktop navigation buttons update the active tab state; Home starts selected.
- Join and Sign in open a simple, accessible authentication modal or equivalent dialog in the corresponding mode. Include a close control, close on Escape, and close on backdrop click if appropriate. Keep the modal styling consistent with the dark/rose glass aesthetic. Do not invent complex product flows.
- Mobile menu opens/closes from its icon and closes after a menu or account action.
- Recommendation checklist toggles each item and updates its completion count.
- Sphere rotates automatically when motion is allowed; supports drag rotation, pointer repulsion, and brief click/tap scatter as detailed above.
- Background lighting responds to pointer parallax only; foreground elements remain stable.
- All controls must work, not merely look clickable. Handle resize and touch input gracefully.

## 12. Implementation Guidance

If implementing in a web app, use the existing framework and project conventions. Use a real WebGL/Three.js particle system (or an equivalent proven particle-rendering library) for the sphere; do not fake it with a static image or a CSS gradient. Use the original hand image where available. Build the layout with responsive CSS and preserve the specified component hierarchy and layering.

Keep animation deterministic and smooth. Clean up animation frames, listeners, and WebGL resources on unmount. Avoid unnecessary rendering work. Do not allow the high particle count to freeze mobile devices; cap pixel ratio, resize correctly, and gracefully reduce rendering cost on low-power devices without changing the overall appearance. Provide a static/reduced-motion fallback if WebGL is unavailable.

## 13. Acceptance Checklist

The result is correct only when all of the following are true:

- The page opens on a full-viewport, near-black cinematic wellness hero with rose lighting.
- The header has Visionary at left, Home / Service / Product / About Us in the desktop center, and Sign in / Join at right; Home is selected.
- The exact headline and supporting paragraph appear on the left with serif/sans typography as specified.
- A realistic upward-cupped hand rises from the bottom center, with a luminous pink particle sphere floating directly above its palm.
- The sphere visibly rotates and responds to pointer/touch interaction; it remains a particle-built 3D sphere, not a solid orb.
- The right/lower recommendation panel has the exact title, three exact habit labels, initial water completion, initial count 1/3, and Live Sync / Today footer.
- The background spotlight, rose glow, subtle texture, vignette, and background-only pointer parallax are present but never overpower the content.
- Mobile uses a working collapsible menu, keeps all content readable, and has no horizontal overflow or overlapping controls.
- Reduced-motion, keyboard focus, image alt text, and functional button/checklist behavior are supported.
- No cyan orb, floating crown/VIP card, unrelated hero content, or extra page sections are introduced.
