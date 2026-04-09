# Fase 14: Inline Styles → Token Migration — Execution Plan

## Objective
Migrar TODOS os inline styles hardcoded para CSS variables/tokens. Meta: zero hex colors, zero hardcoded radius/spacing/font-size/shadow/transition em TSX files.

## Strategy: Migration by Token Type (not by file)

Cada sub-fase usa `grep` para encontrar TODAS as ocorrências de um tipo de token e migra sistematicamente.

## Migration Mapping Tables

### 14.1 Colors → CSS Variables

| Hex Color | Token | Usage Context |
|-----------|-------|---------------|
| `#1c1917` | `var(--color-text-1)` | Primary text, headings |
| `#57534e` | `var(--color-text-2)` | Secondary text |
| `#78716c` | `var(--color-text-3)` | Tertiary text, muted labels |
| `#a8a29e` | `var(--color-text-4)` | Eyebrow, captions (CUIDADO: contraste) |
| `#9a3412` | `var(--color-accent)` | Primary accent, links |
| `#7c2a0e` | `var(--color-accent-hover)` | Hover states |
| `#b45309` | `var(--color-brown-mid)` | Brown mid-tone |
| `#fffdf9` | `var(--color-surface-1)` | Warm surface |
| `#f7f3ed` | `var(--color-bg)` | Page background |
| `#ffffff` | `var(--color-surface-0)` | White surface |
| `#15803d` | `var(--color-autosave-saved-text)` | Auto-save success text |
| `#a16207` | `var(--color-autosave-saving-text)` | Auto-save saving text |
| `#dc2626` | `var(--color-error-text)` | Error text |
| `#1e40af` | `var(--color-note-badge-text)` | Note badge blue |
| `#292524` | `var(--color-kbd-text)` | Keyboard shortcut text |
| `#f5f5f4` | `var(--color-kbd-bg)` | Keyboard key background |
| `#d6d3d1` | `var(--color-kbd-border)` | Keyboard key border |
| `#92400e` | `var(--color-warning-text)` | Warning text, private badge |
| `#64748b` | — | Slate gray — criar `--color-slate: #64748b` |
| `#9f1239` | — | Rose red — criar `--color-rose: #9f1239` |
| `#166534` | `var(--color-success-text)` | Green success text |
| `#2d6a4f` | — | Forest green — criar `--color-forest: #2d6a4f` |
| `#44403c` | — | Warm brown — criar `--color-warm-brown: #44403c` |

**Migration command pattern:**
```bash
# Find all hex colors in TSX files (excluding globals.css)
grep -rn '#[0-9a-fA-F]\{3,8\}' src/ --include='*.tsx' --include='*.ts' | grep -v 'globals.css'
```

### 14.2 Border-Radius → Tokens

| Inline Value | Token | Usage Context |
|-------------|-------|---------------|
| `8px` | `var(--radius-sm)` | Small inputs, kbd keys |
| `10px` | `var(--radius-sm)` | Close to 8px |
| `12px` | `var(--radius-md)` | Small cards, template cards |
| `14px` | `var(--radius-md)` | Medium cards, badges |
| `16px` | `var(--radius-lg)` | Cards, entry cards |
| `18px` | `var(--radius-lg)` | Close to 20px → use lg |
| `20px` | `var(--radius-lg)` | Standard cards |
| `22px` | `var(--radius-lg)` | Close to 20px → use lg |
| `28px` | `var(--radius-xl)` | Hero cards, auth cards |
| `999px`, `9999px`, `100px` | `var(--radius-pill)` | Pills, badges |
| `6px` | — | Criar `--radius-xs: 6px` |
| `4px` | — | Criar `--radius-xs: 4px` (ou usar sm) |
| `2px` | — | Criar `--radius-xs: 4px` |

**New tokens to add ( Fase 13 first):**
```css
--radius-xs: 6px;  /* Tiny: kbd, tiny badges */
```

### 14.3 Padding/Margin → Tokens

| Inline Value | Token | Usage Context |
|-------------|-------|---------------|
| `0.25rem` | `var(--space-1)` | Tiny gaps |
| `0.375rem` | `var(--space-1.5)` | Subtle gaps |
| `0.5rem` | `var(--space-2)` | Small gaps |
| `0.75rem` | `var(--space-3)` | Standard gaps |
| `1rem` | `var(--space-4)` | Card padding |
| `1.25rem` | `var(--space-5)` | Medium card padding |
| `1.5rem` | `var(--space-6)` | Section padding |
| `1.75rem` | `var(--space-7)` | Large padding |
| `2rem` | `var(--space-8)` | Page padding |

**Tricky values needing judgment:**
- `0.38rem` → `var(--space-1.5)` (6px)
- `0.48rem` → `var(--space-1.5)` (6px)
- `0.55rem` → `var(--space-2)` (8px)
- `0.625rem` → `var(--space-2)` (8px)
- `0.775rem` → `var(--space-3)` (12px)
- `0.875rem` → `var(--space-3)` (12px)
- `0.93rem` → `var(--space-3)` (12px)
- `1.35rem` → `var(--space-5)` (20px)

### 14.4 Font-Size → Tokens

| Inline Value | Token | Usage Context |
|-------------|-------|---------------|
| `0.65rem`, `0.68rem`, `0.7rem` | `var(--font-size-2xs)` | Badge dots, captions |
| `0.72rem`, `0.75rem`, `0.775rem`, `0.78rem` | `var(--font-size-xs)` | Eyebrow, labels |
| `0.8rem`, `0.82rem`, `0.85rem` | `var(--font-size-sm)` | Metadata, badges |
| `0.875rem` | `var(--font-size-meta)` | Metadata, status |
| `0.9rem`, `0.925rem`, `0.93rem`, `0.95rem` | `var(--font-size-body-sm)` | Body secondary |
| `1rem` | `var(--font-size-body)` | Body text |
| `1.1rem` | `var(--font-size-h3)` | Subsection |
| `1.25rem`, `1.4rem` | `var(--font-size-h2)` | Section title |
| `1.5rem`, `1.875rem` | `var(--font-size-h1)` | Page title |

### 14.5 Shadow → Tokens

| Inline Value | Token | Usage Context |
|-------------|-------|---------------|
| `0 1px 2px rgba(...)` | `var(--shadow-xs)` | Subtle elevation |
| `0 2px 6px rgba(...)` | `var(--shadow-sm)` | Light cards |
| `0 4px 16px rgba(...)` | `var(--shadow-md)` | Medium cards, dropdowns |
| `0 12px 40px rgba(...)` | `var(--shadow-lg)` | Elevated cards, FAB |
| `0 24px 60px rgba(...)` | `var(--shadow-xl)` | Modals, overlays |
| `0 25px 60px rgba(...)` | `var(--shadow-xl)` | Close match |
| `0 28px 90px rgba(...)` | — | Criar `--shadow-2xl` |
| `inset 0 1px 0 rgba(...)` | — | Inline inset — manter como inline (único caso) |

### 14.6 Transition → Tokens

| Inline Value | Token | Usage Context |
|-------------|-------|---------------|
| `60ms`, `0.08s`, `80ms` | `var(--transition-fast)` | Micro-interactions |
| `120ms`, `0.12s`, `150ms`, `0.15s` | `var(--transition-normal)` | Standard transitions |
| `200ms`, `0.2s`, `250ms` | `var(--transition-slow)` | Complex animations |
| `all 150ms ease` | — | Fix to specific props: `opacity 150ms, background-color 150ms, color 150ms` |

## Execution Order

Dentro de cada sub-fase, migrar por arquivo nesta ordem (menor → maior blast radius):

1. `src/components/ui/` — foundation components (menos arquivos, mais impacto)
2. `src/app/(vault)/patients/[patientId]/components/` — patient profile components
3. `src/app/(vault)/sessions/[appointmentId]/note/components/` — note composer
4. `src/app/(vault)/patients/[patientId]/documents/new/components/` — doc composer
5. `src/app/(vault)/patients/[patientId]/page.tsx` — patient page shell
6. `src/app/(vault)/patients/page.tsx` — patients list
7. Other files as needed

## Verification

```bash
# Zero hex colors in TSX (except globals.css)
grep -rn '#[0-9a-fA-F]\{6\}' src/ --include='*.tsx' | grep -v 'globals.css' | grep -v 'svg' | grep -v 'data:image'
# Expected: 0

# Zero hardcoded radius in TSX
grep -rn 'borderRadius.*"\(2\|4\|6\|10\|12\|16\|18\|22\|32\|100\|9999\)' src/ --include='*.tsx'
# Expected: 0

# Build + tests
npx next build && pnpm test
```
