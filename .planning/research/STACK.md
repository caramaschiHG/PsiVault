# Technology Stack

**Project:** PsiVault v1.6 Documentos
**Researched:** 2026-04-25

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15 | App Router, Server Components, Server Actions | Already established; no migration needed |
| React | 19 | UI runtime | Already established |
| TypeScript | 5.8 | Type safety | Already established; strict mode enabled |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Prisma | 6 | ORM, schema management | Already established; repository pattern built on it |
| PostgreSQL | 15+ (Supabase) | Primary data store | Already established |

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase Auth | — | SSR authentication | Already established; MFA, JWT AAL fast-path |
| @react-pdf/renderer | ^3.x | PDF generation and preview | Already in use, dynamically imported |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@react-pdf/renderer` | ^3.x | PDF buffer generation + client preview | Document composer preview modal |
| CSS custom properties | native | Design tokens (colors, spacing, shadows) | All components; zero inline styles in new code |
| `React.CSSProperties` | native | Inline style objects with type safety | Only for dynamic values; static styles go in CSS |
| `useGlobalShortcuts` | internal | Centralized keyboard shortcut registry | All pages needing single-key shortcuts |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| PDF preview | `@react-pdf/renderer` (client) | Server Action streaming PDF | Higher latency, unnecessary server load; client has all data |
| Dashboard filtering | Client-side derived state | Server-side filtered queries | Simpler, instant UX; document volumes are low for psychology practices |
| Note creation flow | Redirect to `/sessions/{id}/note` | Inline drawer/modal | Drawer requires component extraction; redirect is MVP-safe |
| Keyboard shortcuts | `useGlobalShortcuts` hook | `mousetrap` or `hotkeys-js` | External lib adds bundle; internal hook is 30 lines and sufficient |

## Installation

No new dependencies required for v1.6. All capabilities exist in the current stack.

```bash
# Verify existing PDF library
pnpm list @react-pdf/renderer

# Existing dev dependencies (no change)
pnpm list prisma
pnpm list @prisma/client
```

## Database Changes

```prisma
// Add to PracticeDocument model
@@index([workspaceId, archivedAt, createdAt])
```

This single index supports the dashboard's `listActiveByWorkspace` query pattern. No other schema changes are needed for v1.6.

## Sources

- `prisma/schema.prisma` — existing schema and indexes
- `src/lib/documents/pdf.tsx` — existing @react-pdf/renderer usage
- `src/components/ui/keyboard-shortcuts-modal.tsx` — existing shortcut system
- `package.json` — dependency versions
