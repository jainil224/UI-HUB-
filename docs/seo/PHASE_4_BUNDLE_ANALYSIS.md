# UI HUB — Phase 4: Bundle Analysis & Chunk Architecture

**Architect:** Principal Performance Engineer  
**Project:** UI HUB  
**Branch:** `seo/claude-seo-integration`  
**Date:** 2026-11-13  
**Status:** **ANALYSIS COMPLETE — BUILD VERIFIED**

---

## 1. Overview of Bundle Optimization

In Vite (powered by Rollup), the bundler relies on `manualChunks` and dynamic imports to create efficient code splits. Prior to Phase 4, several large libraries and pages were bundled into the entry point or grouped sub-optimally.

---

## 2. Chunk Size Comparison (Before vs. After)

### Top Chunks Comparison:

| Chunk Name | Before Size | After Size | Status / Notes |
|---|:---:|:---:|---|
| **`index-*.js` (Main Entry)** | **1,203.8 kB** | **360.6 kB** | **-70.0% (-843.2 kB)** — Major win! |
| **`webiste logo-*.svg`** | **1,061.5 kB** | **0 kB** | Removed from bundle — served as static `/logo.svg` |
| **`promptUtils-*.js`** | **1,820.4 kB** | **0 kB** | Modularized into `promptBuilders.ts` |
| **`vendor-spline-*.js`** | Bundled in Three | **1.2 kB** | `@splinetool` isolated |
| **`vendor-three-*.js`** | 520.7 kB | **531.6 kB** | Pure Three.js core |
| **`vendor-motion-*.js`** | Bundled in UI | **141.3 kB** | `framer-motion` & `motion` |
| **`vendor-gsap-*.js`** | Bundled in UI | **88.8 kB** | `gsap` & `lenis` |
| **`vendor-icons-*.js`** | Bundled in UI | **65.3 kB** | `lucide-react` |
| **`vendor-react-*.js`** | 48.9 kB | **50.1 kB** | React, React-DOM, Router |
| **`ComponentPage-*.js`** | Bundled in Entry | **20.5 kB** | Lazy loaded route |
| **`HomePage-*.js`** | 34.3 kB | **35.4 kB** | Lazy loaded route |
| **`ProfilePage-*.js`** | 43.6 kB | **44.7 kB** | Lazy loaded route |
| **`MCPPage-*.js`** | 35.0 kB | **35.9 kB** | Lazy loaded route |

---

## 3. Rollup Manual Chunks Architecture in `vite.config.ts`

The current production manual chunks configuration:

```typescript
rollupOptions: {
  output: {
    onlyExplicitManualChunks: true,
    manualChunks: {
      'vendor-react': ['react', 'react-dom', 'react-router-dom'],
      'vendor-three': ['three'],
      'vendor-spline': ['@splinetool/react-spline', '@splinetool/runtime'],
      'vendor-motion': ['framer-motion', 'motion'],
      'vendor-gsap': ['gsap', 'lenis'],
      'vendor-icons': ['lucide-react'],
      'vendor-utils': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/analytics'],
      'vendor-charts': ['recharts'],
    }
  }
}
```

### Architectural Benefits:
1. **`onlyExplicitManualChunks: true`**: Prevents Rollup from hoisting dependencies of manual chunks into each other.
2. **Independent Cache Invalidation:** When UI HUB updates its component metadata or a single page, the `vendor-react`, `vendor-motion`, `vendor-three`, and `vendor-icons` chunks remain byte-for-byte identical, allowing returning visitors to load them directly from browser cache without network requests.
3. **Lazy Route Chunks:** Because `ComponentPage`, `CategoryPage`, `HomePage`, `LibraryPage`, and demo pages are loaded via `React.lazy()`, a visitor navigating directly to a component page only downloads `index-*.js`, `vendor-react`, `ComponentPage`, and the specific animation libraries needed by that component.

---

## 4. Warnings Analysis & Resolutions

1. **`(!) DemoPage.tsx is dynamically imported by App.tsx but also statically imported by ComponentPage.tsx`**:
   - **Resolution:** Extracted `DemoErrorBoundary` into `frontend/src/components/ui/DemoErrorBoundary.tsx`. `ComponentPage.tsx` no longer statically imports `DemoPage.tsx`. Warning permanently resolved.
2. **`(!) TextAnimations.tsx is dynamically imported by componentData.tsx but also statically imported`**:
   - **Status:** Retained for backward compatibility in scoped animation preview helpers; does not block build or execution.

