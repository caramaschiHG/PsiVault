# Phase 30: Otimização de Assets e Bundle — Summary

**Completed:** 2026-04-26
**Status:** Complete

## What Changed

### 1. Font Optimization (`next/font/google`)
- Migrated from external Google Fonts CSS `@import` to `next/font/google`
- Added `IBM_Plex_Sans` and `IBM_Plex_Serif` font declarations in `src/app/layout.tsx`
- Applied font CSS variables (`--font-sans`, `--font-serif`) to `<body>`
- Removed the `@import url("https://fonts.googleapis.com/...")` from `src/app/globals.css`
- Removed manual `--font-serif`/`--font-sans` declarations from `:root` in globals.css — now injected by next/font

### 2. Package Import Optimization
- Added `"@react-pdf/renderer"` to `experimental.optimizePackageImports` in `next.config.ts`
- Existing entries preserved: `date-fns`, `react-day-picker`, `@dnd-kit/core`, `@dnd-kit/utilities`

### 3. Raw `<img>` Audit
- Verified all 4 raw `<img>` tags have documented exceptions:
  - `mfa-setup/page.tsx:254` — QR code TOTP (data URL)
  - `signature-crop-modal.tsx:282,291` — object URLs ephemeral
  - `signature-upload.tsx:182` — object URL preview
- All have `eslint-disable-next-line @next/next/no-img-element` with explanatory comments

### 4. Lazy Loading Verification
- `react-day-picker` → lazy-loaded via `agenda-grids-lazy.tsx` ✅
- `@react-pdf/renderer` → dynamically imported in `pdf.tsx` ✅
- `react-easy-crop` → lazy-loaded in `signature-upload.tsx` ✅

## Verification

- **Tests:** 453/453 passing
- **Build:** Success, zero TypeScript errors
- **Bundle:** First Load JS ~103 kB (shared), no regression

## Files Modified

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Added `next/font/google` imports and body className |
| `src/app/globals.css` | Removed Google Fonts `@import` and manual font declarations |
| `next.config.ts` | Added `@react-pdf/renderer` to `optimizePackageImports` |

## No-Action Items (Already Optimal)

- Third-party scripts: none found
- Additional lazy loading: all heavy components already lazy-loaded
- `next/image` migration: all raw `<img>` tags are justified exceptions
