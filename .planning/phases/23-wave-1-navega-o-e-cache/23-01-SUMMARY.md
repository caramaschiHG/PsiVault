---
phase: 23-wave-1-navega-o-e-cache
plan: "01"
subsystem: navigation
tags: [next-link, client-side-nav, sidebar, bottom-nav]
dependency_graph:
  requires: []
  provides: [client-side-nav-vault]
  affects: [vault-sidebar-nav, bottom-nav]
tech_stack:
  added: []
  patterns: [next/link for internal navigation]
key_files:
  modified:
    - src/app/(vault)/components/vault-sidebar-nav.tsx
    - src/app/(vault)/components/bottom-nav.tsx
decisions:
  - Signout link (/api/auth/signout) kept as <a> — API route, not internal nav
  - No explicit prefetch prop added — App Router handles on-viewport prefetch by default
  - "Meu perfil" footer link converted to Link along with nav items
metrics:
  duration: "< 5 min"
  completed: "2026-04-22"
  tasks: 3
  files: 2
---

# Phase 23 Plan 01: Migrar navegação vault para Link — Summary

**One-liner:** Substituição de `<a href>` por `<Link>` do Next.js em vault-sidebar-nav.tsx e bottom-nav.tsx para eliminar full page reloads na navegação interna.

## What Was Built

Dois componentes de navegação do vault foram migrados de `<a href>` simples para `<Link>` do Next.js:

- **vault-sidebar-nav.tsx**: 6 itens do NAV_ITEMS map + SETTINGS_ITEM + link "Meu perfil" no footer convertidos para `<Link>`. O link `/api/auth/signout` mantido como `<a href>` (API route).
- **bottom-nav.tsx**: 6 itens do NAV_ITEMS map convertidos para `<Link>`. Nenhum `<a>` remanescente.

## Deviations from Plan

None — plano executado exatamente como especificado.

## Verification

- `import Link from "next/link"` presente em ambos os arquivos ✓
- `<a href="/api/auth/signout">` permanece como `<a>` em vault-sidebar-nav.tsx ✓
- TypeScript compila sem erros nos arquivos modificados ✓
- 407 testes passando sem regressão ✓

## Self-Check: PASSED

- vault-sidebar-nav.tsx: modificado com Link ✓
- bottom-nav.tsx: modificado com Link ✓
- 407 tests passed ✓
