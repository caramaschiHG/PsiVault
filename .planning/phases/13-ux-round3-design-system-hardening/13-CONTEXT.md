# Contexto Técnico — Fase 13 (Foundation Tokens)

## Files to Modify — Complete Inventory

### globals.css (PRIMARY — ~150 lines changed)
**Path:** `src/app/globals.css`
**Changes:**
1. Add z-index tokens (8 new) — lines ~140
2. Add spacing tokens (4 new) — lines ~100
3. Fix font-size redundancy — lines ~80
4. Fix --color-text-3 value — line ~30
5. Fix :focus-visible border-radius — line ~560
6. Remove duplicate @keyframes — lines 437-480 (remove first definitions)
7. Remove duplicate CSS declarations — lines ~370, ~550, ~1200

### Z-Index Migration (~20 files)

| File | Lines | Current z-index | New Token |
|------|-------|----------------|-----------|
| `src/app/globals.css` (skip-link) | ~500 | 9999 | var(--z-skip-link) |
| `src/components/ui/toast-provider.tsx` | TBD | 9999 | var(--z-toast) |
| `src/components/ui/keyboard-shortcuts-modal.tsx` | ~30 | 9999 | var(--z-modal) |
| `src/app/(vault)/financeiro/page-client.tsx` | TBD | 9999, 100 | var(--z-overlay), var(--z-dropdown) |
| `src/components/ui/update-notification.tsx` | TBD | 1001, 1000 | var(--z-toast), var(--z-base) |
| `src/app/(vault)/components/signature-crop-modal.tsx` | TBD | 1000, 1 | var(--z-modal), var(--z-base) |
| `src/app/(vault)/appointments/components/appointment-side-panel.tsx` | TBD | 200, 199 | var(--z-sticky) |
| `src/app/(vault)/components/quick-create-popover.tsx` | TBD | 200 | var(--z-dropdown) |
| `src/app/globals.css` (bottom-nav) | ~570 | 100 | var(--z-sticky) |
| `src/app/(vault)/agenda/page.tsx` | TBD | 90 | var(--z-dropdown) |
| `src/app/(vault)/patients/page.tsx` | ~80 | 90 | var(--z-dropdown) |
| `src/app/(vault)/components/search-bar.tsx` | TBD | 50 | var(--z-dropdown) |
| `src/app/(vault)/components/quick-action-fab.tsx` | TBD | 50 | var(--z-overlay) |
| `src/app/(vault)/agenda/components/week-calendar-grid.tsx` | TBD | 10 | var(--z-base) |
| `src/app/(vault)/agenda/components/calendar-grid.tsx` | TBD | 10 | var(--z-base) |
| `src/app/(vault)/patients/[patientId]/components/documents-section.tsx` | ~100 | 10 | var(--z-dropdown) |
| `src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx` | ~200 | 1 | var(--z-base) |

### Components UI (Phase 15 — ~12 files)

| File | Changes | Lines |
|------|---------|-------|
| `src/components/ui/rich-text-editor.tsx` | SVG icons, focus/hover/active, aria-pressed | ~120 |
| `src/components/ui/auto-save-indicator.tsx` | SVG icons, specific transition | ~30 |
| `src/components/ui/tabs.tsx` | Hover state (CSS) | ~5 |
| `src/components/ui/list.tsx` | Hover visual | ~5 |
| `src/components/ui/keyboard-shortcuts-modal.tsx` | Focus trap | ~25 |
| `src/components/ui/toast-provider.tsx` | Dismiss button | ~15 |

### App Components (Phase 15-16 — ~8 files)

| File | Changes | Lines |
|------|---------|-------|
| `src/app/(vault)/sessions/[appointmentId]/note/components/note-composer-form.tsx` | Template card hover, focus mode React state | ~20 |
| `src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx` | NoteBadge SVG, external link icon, month nav | ~30 |
| `src/app/(vault)/patients/[patientId]/components/documents-section.tsx` | Keyboard support for dropdown | ~15 |
| `src/app/(vault)/patients/[patientId]/page.tsx` | Shell padding → tokens | ~5 |
| `src/app/(vault)/patients/[patientId]/components/patient-config-tab.tsx` | TBD | TBD |
| `src/app/(vault)/patients/[patientId]/components/patient-financeiro-tab.tsx` | TBD | TBD |
| `src/app/(vault)/patients/[patientId]/components/patient-overview-tab.tsx` | TBD | TBD |
| `src/app/(vault)/patients/[patientId]/components/patient-profile-tabs.tsx` | TBD | TBD |

## Dependency Order

```
Step 1: globals.css (add tokens, clean duplicates)
         ↓
Step 2: Migrate z-index in all files (uses new tokens)
         ↓
Step 3: Migrate other inline styles (colors, radius, spacing)
         ↓
Step 4: Component polish (SVG icons, focus states, hover)
         ↓
Step 5: UX flows (validation, keyboard support)
         ↓
Step 6: QA (build, tests, lighthouse)
```

## Risk Mitigation Checklist

- [ ] Commit BEFORE starting each sub-task
- [ ] Run `npx next build` after each sub-task
- [ ] Run `pnpm test` after each sub-task
- [ ] Visual diff before committing (check for layout shifts)
- [ ] If build fails: revert commit, investigate, re-apply
- [ ] If visual regression: compare before/after screenshots

## Tools Available

```bash
# Find all hex colors in TSX
grep -rn '#[0-9a-fA-F]\{6\}' src/ --include='*.tsx' | grep -v 'globals.css' | grep -v 'svg' | wc -l

# Find all hardcoded borderRadius
grep -rn 'borderRadius.*"' src/ --include='*.tsx' | grep -v 'var(--' | wc -l

# Find all hardcoded padding
grep -rn 'padding.*"' src/ --include='*.tsx' | grep -v 'var(--' | wc -l

# Find all hardcoded zIndex
grep -rn 'zIndex.*[0-9]' src/ --include='*.tsx' | grep -v 'var(--' | wc -l

# Count duplicate keyframes
grep -c '@keyframes vaultPageIn' src/app/globals.css  # should be 1 after fix

# Check contrast ratio (manual)
# #57534e on #ffffff = 6.1:1 ✅
# #57534e on #f7f3ed = 5.9:1 ✅
```
