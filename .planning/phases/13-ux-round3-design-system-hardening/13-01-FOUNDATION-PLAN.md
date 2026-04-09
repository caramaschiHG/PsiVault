# Fase 13: Foundation Tokens — Detailed Execution Plan

## Objective
Criar e corrigir todos os tokens de foundation no globals.css, limpando código morto e preparando o sistema para migração em massa.

## Entry Gates
- [x] Build passando (`npx next build` ✅)
- [x] Tests passando (`pnpm test` ✅ 351/351)
- [x] Audit completo (44 itens catalogados)
- [x] Plan document criado

## Exit Gates
- [ ] `npx next build` ✅ (zero errors)
- [ ] `pnpm test` ✅ (351/351)
- [ ] Zero @keyframes duplicados no globals.css
- [ ] Zero CSS declarations duplicadas
- [ ] Z-index token system definido e usado
- [ ] Spacing tokens completos
- [ ] Font-size sem redundância
- [ ] Contraste --color-text-3 ≥ 4.5:1
- [ ] :focus-visible sem border-radius fixo

## Tasks Detail

### 13.1 Z-Index Token System
**File:** `src/app/globals.css`

Adicionar em `:root`:
```css
/* ═══════════════════════════════════════════════════════════════
   Z-INDEX — Escala de elevação (8 níveis)
   ═══════════════════════════════════════════════════════════════ */
--z-base:       1;      /* Sticky headers dentro de content */
--z-dropdown:   100;    /* Dropdown menus, popovers */
--z-sticky:     200;    /* Side panels, sticky nav elements */
--z-overlay:    300;    /* Overlays, dropdowns especiais */
--z-modal:      400;    /* Modals, dialogs, sheets */
--z-toast:      500;    /* Toast notifications */
--z-skip-link:  900;    /* Skip link (accessibility) */
--z-max:        9999;   /* Emergências apenas */
```

**Arquivos para atualizar** (migrar valores hardcodados):
| Arquivo | Valor atual | Token novo |
|---------|------------|------------|
| `globals.css` (skip-link) | 9999 | `var(--z-skip-link)` |
| `toast-provider.tsx` | 9999 | `var(--z-toast)` |
| `keyboard-shortcuts-modal.tsx` | 9999 | `var(--z-modal)` |
| `financeiro/page-client.tsx` overlay | 9999 | `var(--z-overlay)` |
| `financeiro/page-client.tsx` dropdown | 100 | `var(--z-dropdown)` |
| `update-notification.tsx` | 1001 | `var(--z-toast)` |
| `update-notification.tsx` bg | 1000 | `var(--z-base)` |
| `signature-crop-modal.tsx` | 1000 | `var(--z-modal)` |
| `appointment-side-panel.tsx` | 200 | `var(--z-sticky)` |
| `appointment-side-panel.tsx` bg | 199 | `var(--z-sticky)` |
| `quick-create-popover.tsx` | 200 | `var(--z-dropdown)` |
| `globals.css` (bottom-nav) | 100 | `var(--z-sticky)` |
| `agenda/page.tsx` | 90 | `var(--z-dropdown)` |
| `patients/page.tsx` | 90 | `var(--z-dropdown)` |
| `search-bar.tsx` | 50 | `var(--z-dropdown)` |
| `quick-action-fab.tsx` | 50 | `var(--z-overlay)` |
| `week-calendar-grid.tsx` | 10 | `var(--z-base)` |
| `calendar-grid.tsx` | 10 | `var(--z-base)` |
| `documents-section.tsx` | 10 | `var(--z-dropdown)` |
| `clinical-timeline.tsx` | 1 | `var(--z-base)` |

### 13.2 Spacing Tokens Faltando
**File:** `src/app/globals.css`

Adicionar em `:root`:
```css
/* Adicionar aos existentes */
--space-1.5: 0.375rem;  /* 6px   — gaps sutis, padding interno */
--space-5:   1.25rem;   /* 20px  — padding de card médio */
--space-7:   1.75rem;   /* 28px  — gap entre seções */
--space-10:  2.5rem;    /* 40px  — gap entre grandes seções */
```

### 13.3 Font-Size Redundância
**File:** `src/app/globals.css`

Atualizar:
```css
/* ANTES (redundante) */
--font-size-label:    0.75rem;    /* 12px — eyebrow uppercase */
--font-size-xs:       0.75rem;    /* 12px — timestamps, captions */

/* DEPOIS (distinto) */
--font-size-2xs:    0.6875rem;  /* 11px — captions mínimas, badge dots */
--font-size-xs:     0.75rem;    /* 12px — timestamps, captions, eyebrow */
--font-size-sm:     0.8125rem;  /* 13px — labels, badges, metadata */
--font-size-meta:   0.875rem;   /* 14px — metadata, dates, status */
```

### 13.4 Contraste --color-text-3
**File:** `src/app/globals.css`

Mudar:
```css
/* ANTES (4.4:1 sobre --color-bg — FAIL AA por 0.1) */
--color-text-3:       #78716c;

/* DEPOIS (6.1:1 sobre #fff — PASS AA) */
--color-text-3:       #57534e;
```

**Arquivos afetados** (usam #78716c inline e precisam migrar):
- `rich-text-editor.tsx` → usar `var(--color-text-3)` (agora #57534e, ok)
- `keyboard-shortcuts-modal.tsx` → usar `var(--color-text-3)`

### 13.5 :focus-visible Border-Radius Fixo
**File:** `src/app/globals.css`

Mudar:
```css
/* ANTES */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* DEPOIS */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: inherit;
}
```

### 13.6 Limpar @keyframes Duplicados
**File:** `src/app/globals.css`

Remover duplicatas (manter APENAS a versão mais recente/correta):
- `vaultPageIn` → manter linha 564 (200ms, 8px) — remover linha 437
- `toastSlideIn` → manter linha 1267 — remover linha 448
- `fabEnter` → manter linha 1277 — remover linha 459
- `searchDropdownIn` → manter linha 1287 — remover linha 470
- `badgeDotPulse` → manter linha 1297 — remover linha 1261

### 13.7 Limpar CSS Declarations Duplicadas
**File:** `src/app/globals.css`

Remover duplicatas (manter última versão):
- `.card-hover:hover` — manter linha ~1218
- `.btn-primary:active` — manter versão global
- `.btn-secondary:active` — manter versão global
- `.btn-ghost:active` — manter versão global
- `.btn-danger:active` — manter versão global
- `:focus-visible` — manter linha 1243
- `.row-interactive:hover/:active` — manter versão mais recente
- `.link-subtle:hover` — manter versão mais recente
- `.input-field:focus` — manter versão mais recente

### 13.8 Tokens de Cores Semânticas Faltando
**File:** `src/app/globals.css`

Adicionar em `:root`:
```css
/* ═══════════════════════════════════════════════════════════════
   SEMANTIC COLORS — Component-specific
   ═══════════════════════════════════════════════════════════════ */

/* Keyboard shortcuts modal */
--color-kbd-bg:         #f5f5f4;
--color-kbd-border:     #d6d3d1;
--color-kbd-text:       #292524;
--color-kbd-shadow:     #a8a29e;

/* Template cards */
--color-template-bg:    rgba(255, 252, 247, 0.95);
--color-template-border: rgba(146, 64, 14, 0.15);
--color-template-text:  #1c1917;
--color-template-desc:  var(--color-text-3);

/* Auto-save states (já existem --color-success/error-bg, mas adicionar text) */
--color-autosave-saving-bg:   rgba(254, 243, 199, 0.95);
--color-autosave-saving-text: #a16207;
--color-autosave-saved-bg:    rgba(240, 253, 244, 0.95);
--color-autosave-saved-text:  #15803d;

/* Communication links (WhatsApp/Email) */
--color-comm-link-bg:      rgba(255, 247, 237, 0.8);
--color-comm-link-border:  rgba(146, 64, 14, 0.15);
--color-comm-link-text:    var(--color-accent);

/* Note badge */
--color-note-badge-bg:   rgba(219, 234, 254, 0.9);
--color-note-badge-text: #1e40af;

/* Submit button (document composer) */
--color-submit-bg:       var(--color-accent);
--color-submit-text:     #fff7ed;
```

## Verification Commands

```bash
# Build
npx next build

# Tests
pnpm test

# Verify no duplicate keyframes
grep -c '@keyframes vaultPageIn' src/app/globals.css  # deve ser 1
grep -c '@keyframes toastSlideIn' src/app/globals.css  # deve ser 1

# Verify z-index tokens em uso
grep -r 'var(--z-' src/ | wc -l  # deve ser > 0

# Verify contraste
# --color-text-3 (#57534e) sobre #ffffff = 6.1:1 ✅
# --color-text-3 (#57534e) sobre #f7f3ed = 5.9:1 ✅
```

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Break visual layout | Low | High | Commit por task, diff visual antes |
| Token naming conflict | Low | Medium | Prefixar com --color-, --z-, --space- |
| Miss some inline values | Medium | Low | Grep para verificar pós-migração |
| Build fail | Low | High | Testar após cada sub-task |

## Estimated Impact

- **Files changed:** ~25 (globals.css + ~20 component files para z-index)
- **Lines changed:** ~150 (globals.css) + ~80 (component files)
- **Visual change:** Mínimo (apenas correção de valores inconsistentes)
- **Breaking change:** Não (tokens new, valores existentes mantidos)
