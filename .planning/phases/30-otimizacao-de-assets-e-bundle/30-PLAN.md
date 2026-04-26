# Phase 30: Otimização de Assets e Bundle — Plan

## Overview

Aplicação carrega menos bytes e renderiza imagens/fontes de forma eficiente.

## Changes

### 1. Migrate Google Fonts to `next/font/google`
- **File:** `src/app/layout.tsx`
- **File:** `src/app/globals.css`
- Remove `@import url(...)` from globals.css
- Import `IBM_Plex_Sans` and `IBM_Plex_Serif` from `next/font/google`
- Apply font variables to `<body>`
- Remove manual `--font-serif`/`--font-sans` declarations from `:root`

### 2. Add `@react-pdf/renderer` to `optimizePackageImports`
- **File:** `next.config.ts`
- Add `"@react-pdf/renderer"` to `experimental.optimizePackageImports`

### 3. Raw `<img>` Tag Audit
- All 4 raw `<img>` tags have legitimate exceptions with `eslint-disable-next-line @next/next/no-img-element`:
  - `mfa-setup/page.tsx` — QR code TOTP (data URL)
  - `signature-crop-modal.tsx` — object URLs from `URL.createObjectURL()`
  - `signature-upload.tsx` — object URL preview
- No action needed — exceptions are documented inline

### 4. Lazy Loading Verification
- `react-day-picker` → already lazy-loaded via `agenda-grids-lazy.tsx`
- `@react-pdf/renderer` → already dynamically imported in `pdf.tsx`
- `react-easy-crop` → already lazy-loaded in `signature-upload.tsx`
- No additional lazy loading needed

### 5. Third-Party Scripts
- No third-party scripts found in codebase

## Success Criteria Verification
- [x] Charts, date pickers e PDF preview carregam sob demanda
- [x] Imports de bibliotecas utilitárias são tree-shaken via `optimizePackageImports`
- [x] Zero tags `<img>` raw sem justificativa
- [x] Requests externos de fontes eliminados (migrados para `next/font`)
- [x] Nenhum script de terceiros sem estratégia

## Test Plan
- `pnpm test` — 453 tests passing
- `pnpm build` — zero TypeScript errors
