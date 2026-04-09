# GSD Phase Discussion — UX Round 3: Design System Hardening

## Document Purpose
Discussion of ALL phases (13-17) with senior engineering perspective: trade-offs, risks, alternative approaches, and execution strategy.

---

## Phase 13: Foundation Tokens (Score 6.2 → 7.2)

### What We're Doing
Creating and fixing the foundational tokens that everything else depends on. This is "infrastructure work" — invisible to users but critical for everything that follows.

### Tasks Recap
| Task | What | Why | Risk |
|------|------|-----|------|
| 13.1 | Z-index token system (8 tokens) | 26 hardcoded values → collision city | Low |
| 13.2 | Spacing tokens (--space-1.5, --space-5, --space-7) | Missing 6px, 20px, 28px — most used values | None |
| 13.3 | Font-size redundancy fix | --font-size-xs == --font-size-label (same value!) | None |
| 13.4 | Contrast fix --color-text-3 (#78716c → #57534e) | Fails WCAG AA by 0.1 | None |
| 13.5 | :focus-visible border-radius inherit | 4px fixed looks wrong on round elements | None |
| 13.6 | Remove duplicate @keyframes (5 pairs, ~40 lines) | CSS dead code, confusing | None |
| 13.7 | Remove duplicate CSS declarations (~20 blocos) | CSS dead code | None |
| 13.8 | Semantic color tokens (kbd, template, comm) | 50+ colors hardcoded → need tokens first | Low |

### Design Decisions

#### Decision 1: Z-Index Scale — 8 levels or more?
**Chosen:** 8 levels (base, dropdown, sticky, overlay, modal, toast, skip-link, max)
**Rejected:** 12 levels (too granular, devs won't remember which is which)
**Rationale:** 8 levels cover all current use cases (26 values map to 8 buckets). More levels create confusion, not clarity.

**Mapping:**
```
26 current values → 8 tokens:
  1       → --z-base (sticky headers inside content)
  10      → --z-base (calendar layers)
  50      → --z-dropdown (search, FAB)
  90      → --z-dropdown (agenda, patients overlays)
  100     → --z-dropdown (bottom nav, financeiro dropdown)
  199-200 → --z-sticky (side panels, popovers)
  1000    → --z-modal (update notification bg, signature crop modal)
  1001    → --z-toast (update notification)
  9999    → --z-max (toast, keyboard modal, skip-link)
```

#### Decision 2: Should we fix the --color-text-3 contrast NOW or defer?
**Chosen:** Fix now (part of 13.4)
**Alternative:** Defer to Phase 15 (component polish)
**Rationale:** This is a token-level fix. If we fix it in globals.css NOW, all components that use `var(--color-text-3)` automatically get the fix. If we defer, we have to fix each component individually later. Fix once at source.

**Impact:** `#78716c` → `#57534e` is slightly darker. Visual change is subtle (5.9:1 → 6.1:1 on white). No component should look worse.

#### Decision 3: Remove duplicate CSS — which version to keep?
**Rule:** Always keep the LAST definition (browser uses it anyway). BUT verify the last definition is intentional:
- `vaultPageIn`: Last version uses 200ms/8px (smoother than 180ms/6px) ✅
- `toastSlideIn`: Both identical ✅
- `badgeDotPulse`: Both identical ✅

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Z-index change breaks overlay stacking | Low | High | Test cada overlay após migração |
| Color change visible to users | Low | Low | #78716c → #57534e is subtle (slightly darker) |
| Removing CSS breaks something | Very Low | Medium | Build + tests catch this |
| Token naming wrong | Low | Medium | Review names before committing |

### Alternative Approaches Considered

**Approach A:** Fix tokens AND migrate inline styles in SAME phase
- **Rejected:** Too much change at once. If something breaks, hard to isolate.
- **Why Phase 14 separate:** Each file in Phase 14 is independent. Can commit file-by-file. Phase 13 is all-or-nothing (globals.css).

**Approach B:** Don't clean duplicate CSS now, do it with inline migration
- **Rejected:** Duplicate CSS is dead code that confuses future devs. Clean it now (5 min) while we're in globals.css.

### Success Criteria
- [ ] `npx next build` ✅
- [ ] `pnpm test` ✅ 351/351
- [ ] Zero duplicate @keyframes
- [ ] Zero duplicate CSS declarations
- [ ] All z-index values use tokens
- [ ] --color-text-3 contrast ≥ 4.5:1

### Estimated Effort
- **Optimistic:** 20 minutes (straightforward token additions)
- **Realistic:** 35 minutes (z-index migration across 20 files takes time)
- **Pessimistic:** 60 minutes (if z-index changes cause stacking issues)

---

## Phase 14: Inline Styles → Token Migration (Score 7.2 → 8.4)

### What We're Doing
The BIGGEST phase. Migrating ALL inline styles in ALL TSX files to use CSS variables. This is the single highest-impact change.

### Tasks Recap
| Task | What | Files | Impact |
|------|------|-------|--------|
| 14.1 | Colors → CSS variables | ~50 files | ELIMINATES 274+ hardcoded colors |
| 14.2 | Border-radius → tokens | ~40 files | ELIMINATES 146+ hardcoded radius |
| 14.3 | Padding/margin → tokens | ~50 files | ELIMINATES 274+ hardcoded spacing |
| 14.4 | Font-size → tokens | ~30 files | ELIMINATES 14+ non-scale values |
| 14.5 | Shadow → tokens | ~20 files | ELIMINATES hardcoded shadows |
| 14.6 | Transition → tokens | ~15 files | ELIMINATES hardcoded transitions |

### Design Decisions

#### Decision 1: Migration Strategy — By Token Type vs By File
**Chosen:** By token type (migrate ALL colors, then ALL radius, etc.)
**Alternative:** By file (migrate all tokens in file A, then file B, etc.)

**Why by token type:**
1. Each sub-task is grep-able: `grep -rn '#[0-9a-fA-F]\{6\}' src/ --include='*.tsx'`
2. Each sub-task is independently verifiable: count before → count after = 0
3. Parallelizable: 6 sub-tasks can run simultaneously
4. Atomic: if one type breaks, others are unaffected

**Why NOT by file:**
1. Hard to track progress: "file A is 60% migrated" is meaningless
2. Not grep-able: no single command to verify completion
3. Not parallelizable: each file touches all token types
4. Risky: a single file with many inline styles is a large commit

#### Decision 2: Should We Create New Tokens for Unique Values?
Some inline values don't map to existing tokens:
- `padding: "1.35rem 1.5rem"` → no exact token match
- `borderRadius: "22px"` → between --radius-lg (20px) and --radius-xl (28px)

**Chosen:** Map to NEAREST existing token. DON'T create new tokens for edge cases.
**Rationale:** Adding a token for every unique value defeats the purpose. Token system = constraint = consistency.

**Mapping rules:**
- `22px` → `--radius-lg` (20px) — 2px difference is imperceptible
- `18px` → `--radius-lg` (20px) — 2px difference is imperceptible
- `1.35rem` → `--space-5` (1.25rem) — closest match
- `0.38rem` → `--space-1.5` (0.375rem) — 0.005rem difference = 0.08px (imperceptible)

#### Decision 3: What About Inline Styles That CAN'T Be Tokens?
Some inline styles are genuinely dynamic:
- `style={{ width: \`${percentage}%\` }}` — computed value
- `style={{ backgroundImage: \`url(${src})\` }}` — dynamic URL

**Rule:** These are ALLOWED. We only migrate STATIC values that map to tokens.

**Heuristic:** If the value is a literal that matches a token (e.g., `"#1c1917"` → `var(--color-text-1)`), migrate. If it's computed or dynamic, leave it.

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regression (subtle shift) | Medium | Low | Diff each commit, revert if unacceptable |
| Token doesn't exist yet | Low | Medium | Phase 13 creates all needed tokens first |
| Miss some values | Medium | Low | Grep after phase, add to Phase 17 cleanup |
| Build breaks | Low | High | Commit per sub-task, revert if needed |
| Test breaks | Low | High | Same as above |

### Execution Order Within Phase

**Recommended order (lowest risk → highest risk):**

1. **14.6 Transitions** (15 files, lowest risk — just timing)
2. **14.5 Shadows** (20 files, low risk — visual polish)
3. **14.4 Font-size** (30 files, low risk — slight size changes)
4. **14.2 Border-radius** (40 files, medium risk — shape changes)
5. **14.3 Padding/margin** (50 files, medium risk — layout shifts)
6. **14.1 Colors** (50 files, highest risk — most changes, most visible)

**Why this order:** Start with least visible changes (transitions, shadows) and work up to most visible (colors). If something breaks, we catch it early with less dramatic visual changes.

### Alternative Approaches Considered

**Approach A:** Use a codemod tool (like jscodeshift) to auto-migrate
- **Rejected:** Overkill for this scale. Manual migration with grep is faster for ~200 files.
- **When to use codemod:** If we had 500+ files or needed to do this repeatedly.

**Approach B:** Migrate colors AND radius in same sub-task
- **Rejected:** Harder to verify. If something breaks, unclear which type caused it.
- **Why separate:** `grep '#[0-9a-fA-F]'` and `grep 'borderRadius'` are independent. Separate = atomic.

### Success Criteria
- [ ] `npx next build` ✅
- [ ] `pnpm test` ✅ 351/351
- [ ] Zero hex colors in TSX (verified by grep)
- [ ] Zero hardcoded border-radius in TSX (verified by grep)
- [ ] Zero hardcoded padding in TSX (verified by grep)
- [ ] Zero hardcoded font-size in TSX (verified by grep)
- [ ] Zero hardcoded shadows in TSX (verified by grep)
- [ ] Zero hardcoded transitions in TSX (verified by grep)

### Estimated Effort
- **Optimistic:** 45 minutes (grep + replace is fast)
- **Realistic:** 75 minutes (careful review of each file, commit per sub-task)
- **Pessimistic:** 120 minutes (if visual regressions need investigation)

---

## Phase 15: Component Polish & Accessibility (Score 8.4 → 9.0)

### What We're Doing
Making every component feel premium: hover states, focus states, SVG icons, keyboard navigation, focus traps. This is the "feel" phase — users won't see it, they'll FEEL it.

### Tasks Recap
| Task | What | File | Impact |
|------|------|------|--------|
| 15.1 | RTE toolbar: focus/hover/active/aria-pressed | rich-text-editor.tsx | 17 buttons accessible |
| 15.2 | RTE: emojis → SVG icons (17 buttons) | rich-text-editor.tsx | Consistent icons |
| 15.3 | AutoSaveIndicator: emojis → SVG | auto-save-indicator.tsx | Consistent icons |
| 15.4 | NoteBadge: emoji → SVG | clinical-timeline.tsx | Consistent icons |
| 15.5 | ASI: transition specific (not "all") | auto-save-indicator.tsx | No layout shift risk |
| 15.6 | Tab: hover state | tabs.tsx | Clickable affordance |
| 15.7 | ListItem: hover visual | list.tsx | Interactive feedback |
| 15.8 | Template cards: hover/press | note-composer-form.tsx | Interactive feedback |
| 15.9 | KeyboardModal: focus trap | keyboard-shortcuts-modal.tsx | A11y requirement |
| 15.10 | Toast: dismiss button | toast-provider.tsx | User control |
| 15.11 | Focus mode: React state | note-composer-form.tsx | Robust pattern |
| 15.12 | Card variants: unify radius/shadow | multiple | Visual consistency |

### Design Decisions

#### Decision 1: SVG Icons — Inline vs Library
**Chosen:** Inline SVGs (copy-paste Lucide paths)
**Alternative:** Install lucide-react package

**Why inline:**
1. Zero dependencies — no bundle size increase
2. No version lock — no risk of icon changes on update
3. Consistent with existing codebase — no import pattern changes
4. Only ~20 icons needed — manageable

**Why NOT lucide-react:**
1. Adds 1 dependency (even if tree-shaken, build config needed)
2. Import pattern inconsistency (existing code doesn't use icon libs)
3. Overkill for 20 icons
4. If we had 100+ icons, library would make sense

#### Decision 2: aria-pressed on RTE Toolbar — Which Buttons?
Not all buttons need `aria-pressed`. Only TOGGLE buttons (state that persists):

**Need aria-pressed:**
- Bold, Italic, Underline (formatting toggles)
- H1, H2, Paragraph (block format — mutually exclusive, use aria-pressed on active one)
- Blockquote (toggle)
- AlignLeft, AlignCenter, AlignRight (mutually exclusive)

**Don't need aria-pressed:**
- InsertUnorderedList, InsertOrderedList (these are actions, not toggles)
- createLink (action — opens prompt)
- insertHorizontalRule (action)
- removeFormat (action)
- Undo, Redo (actions)

**Implementation:** Track active formats in state:
```tsx
const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
```

On each exec(), update the set. On render, check `activeFormats.has(action)`.

**Caveat:** This is a SIMPLIFIED approach. A proper RTE would use `document.queryCommandState()` to check actual formatting state. But for PsiLock's simple editor, state tracking is sufficient.

#### Decision 3: Focus Trap — Manual vs Library
**Chosen:** Manual focus trap (query focusable elements, trap Tab)
**Alternative:** Use `focus-trap-react` library

**Why manual:**
1. Only 1 modal needs it (KeyboardShortcutsModal)
2. ~20 lines of code — library is overkill
3. No dependency
4. Simple use case (single dialog, known structure)

**When to use library:**
- Multiple modals throughout the app
- Complex focus management (nested traps, return focus)
- Need robust handling of edge cases (iframes, shadow DOM)

#### Decision 4: NoteComposer Focus Mode — Custom Event vs Context
**Problem:** Focus mode needs to collapse the sidebar. The NoteComposer doesn't have access to sidebar state.

**Option A:** Custom DOM event
```tsx
window.dispatchEvent(new CustomEvent('vault:sidebar-toggle', { detail: { collapsed: !focusMode } }));
```

**Option B:** React Context
```tsx
const { toggleSidebar } = useVaultContext();
toggleSidebar(!focusMode);
```

**Chosen:** Option A (Custom Event)
**Why:** 
1. No need to refactor vault layout to expose context
2. Minimal blast radius (only affects note-composer and vault layout listener)
3. Same pattern used by other apps for cross-component communication

**Risk:** Event listener in vault layout must be added. If not, focus mode silently fails.
**Mitigation:** Add the listener in the same commit as the dispatch.

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| SVG icon paths wrong | Low | Low | Preview in browser before commit |
| aria-pressed state out of sync | Medium | Low | Editor is simple, state tracking works |
| Focus trap breaks on edge case | Low | Medium | Test with keyboard-only navigation |
| Focus mode event not caught | Low | Medium | Add listener in same commit |
| Toast dismiss breaks toast flow | Low | Medium | Test toast creation + dismissal |

### Execution Order Within Phase

**Recommended order (independent tasks first):**

1. **15.5 ASI transition** (1 file, 1 line change — trivial)
2. **15.6 Tab hover** (1 CSS addition — trivial)
3. **15.7 ListItem hover** (1 file, 1 line — trivial)
4. **15.3 AutoSaveIndicator SVG** (1 file, replace 3 emojis)
5. **15.4 NoteBadge SVG** (1 file, replace 1 emoji)
6. **15.12 Card unify** (3-4 files, change inline → tokens)
7. **15.8 Template card hover** (1 file, CSS addition)
8. **15.2 RTE SVG icons** (1 file, 17 icons — most work)
9. **15.1 RTE focus/hover/active** (1 file, CSS + aria-pressed logic)
10. **15.9 KeyboardModal focus trap** (1 file, ~20 lines)
11. **15.10 Toast dismiss** (1 file, ~15 lines)
12. **15.11 Focus mode React state** (1-2 files, refactor)

### Alternative Approaches Considered

**Approach A:** Use a proper RTE library (TipTap, Slate) instead of polishing execCommand
- **Rejected:** Out of scope for this phase. Would be a separate feature request.
- **When to do it:** If PsiLock needs advanced editing (tables, images, embeds, collaborative editing).

**Approach B:** Skip aria-pressed, just do focus/hover
- **Rejected:** aria-pressed is required for screen reader users to know which format is active. Critical for a11y.

### Success Criteria
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Zero emojis as structural icons
- [ ] All RTE buttons have focus-visible
- [ ] All RTE toggle buttons have aria-pressed
- [ ] Tab has hover state
- [ ] ListItem has hover visual
- [ ] KeyboardModal traps focus
- [ ] Toast has dismiss button

### Estimated Effort
- **Optimistic:** 40 minutes (icons are copy-paste, CSS is simple)
- **Realistic:** 65 minutes (RTE aria-pressed logic takes thought)
- **Pessimistic:** 90 minutes (if focus trap edge cases or toast refactor needed)

---

## Phase 16: UX Flow & Interaction Polish (Score 9.0 → 9.4)

### What We're Doing
Improving the USER FLOWS — how humans actually use the app. Not just making components look good, but making the experience of using the app feel polished.

### Tasks Recap
| Task | What | File | Impact |
|------|------|------|--------|
| 16.1 | Inline validation (blur) | patient-form.tsx | Catch errors before submit |
| 16.2 | Auto-save draft | patient-form.tsx | No data loss on navigate away |
| 16.3 | Keyboard support for "Enviar" dropdown | documents-section.tsx | Accessible by keyboard |
| 16.4 | External link indicator | clinical-timeline.tsx | Users know links open externally |
| 16.5 | Shell padding → tokens | page.tsx | Consistent with design system |
| 16.6 | Month jump nav | clinical-timeline.tsx | Navigate long timelines |
| 16.7 | Paste formatting toggle | rich-text-editor.tsx | User choice: keep or strip formatting |

### Design Decisions

#### Decision 1: Inline Validation — On Blur vs On Change
**Chosen:** On blur (when user leaves the field)
**Alternative:** On change (as user types)

**Why blur:**
1. No "spammy" errors while user is still typing
2. User sees error when they're done with the field (natural moment)
3. Industry standard (Google Forms, Typeform, most SaaS)

**Why NOT on change:**
1. Annoying: error appears while user is mid-typing
2. Can cause layout shift as error message appears
3. Users ignore errors that appear too early

**Exception:** For "confirm password" or "match pattern" fields, validate on change AFTER the first blur.

#### Decision 2: Auto-Save — Same Hook as NoteComposer?
**Chosen:** Yes, reuse `useAutoSave` hook
**Alternative:** Custom save logic

**Why reuse:**
1. Already built and tested
2. Consistent UX (same indicator, same behavior)
3. One source of truth for draft management

**Implementation:** Add to PatientForm:
```tsx
const { status, lastSaved, markDirty } = useAutoSave(
  `patient-form-draft-${patientId}`,
  JSON.stringify(formData),
  3000,  // Longer debounce for form (3s vs 2s for notes)
);
```

**Caveat:** PatientForm has multiple fields (name, email, phone, etc.), not just a textarea. Need to serialize form state to JSON for localStorage.

#### Decision 3: Month Jump Nav — Sticky Headers vs Sidebar Index
**Chosen:** Enhance existing sticky headers with scroll-snap
**Alternative:** Sidebar with month links (like Wikipedia TOC)

**Why enhance sticky headers:**
1. Already implemented (month headers are sticky)
2. Add `scroll-snap-type: y mandatory` to container
3. Add `scroll-snap-align: start` to month groups
4. Minimal code change, maximal UX improvement

**When to use sidebar index:**
- Timeline has 50+ entries across many months
- User needs to jump from January 2024 to March 2025 quickly
- Consider for Phase 17 if timelines get long

#### Decision 4: External Link Indicator — Icon vs Text
**Chosen:** Icon (↗) next to link text
**Alternative:** Text label "abre em nova aba"

**Why icon:**
1. Universal pattern (users recognize it)
2. Compact (doesn't clutter UI)
3. Accessible with aria-label

**Implementation:**
```tsx
<a href={waUrl} target="_blank" rel="noreferrer" aria-label="Enviar lembrete por WhatsApp (abre em nova aba)">
  WhatsApp
  <ExternalLinkIcon size={12} />
</a>
```

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Validation logic wrong | Low | Medium | Test each field manually |
| Auto-save conflicts with submit | Low | High | Clear draft on successful submit |
| Month scroll-snap too aggressive | Medium | Low | Use `proximity` not `mandatory` |
| Paste toggle confuses users | Low | Medium | Default to strip formatting (safer) |

### Execution Order Within Phase

**Recommended order (independent → dependent):**

1. **16.5 Shell padding** (1 file, 1 line — trivial)
2. **16.4 External link icon** (1 file, add icon to existing links)
3. **16.6 Month jump nav** (enhance existing sticky headers)
4. **16.3 Keyboard dropdown** (add Enter/Space/Escape to <details>)
5. **16.1 Inline validation** (PatientForm blur logic)
6. **16.2 Auto-save** (add useAutoSave hook to PatientForm)
7. **16.7 Paste toggle** (add formatting option to RTE)

### Alternative Approaches Considered

**Approach A:** Skip inline validation, only validate on submit
- **Rejected:** Current behavior. Users lose time filling form → submit → error → re-fill.
- **Why blur validation:** Industry standard. Catches errors at the right moment (when user is done with a field).

**Approach B:** Don't add auto-save to PatientForm
- **Rejected:** PatientForm can take 5-10 minutes to fill (demographics, contacts, etc.). Losing that data is painful.
- **Note:** This is a common complaint in health SaaS apps. Auto-save on forms is table stakes in 2026.

### Success Criteria
- [ ] PatientForm validates on blur with inline errors
- [ ] PatientForm auto-saves drafts to localStorage
- [ ] DocumentsSection "Enviar" dropdown accessible via keyboard
- [ ] Communication links have external link icon
- [ ] ClinicalTimeline has month scroll-snap
- [ ] RichTextEditor has paste formatting toggle

### Estimated Effort
- **Optimistic:** 30 minutes (most tasks are small additions)
- **Realistic:** 50 minutes (inline validation logic needs care)
- **Pessimistic:** 75 minutes (if paste toggle or month nav is complex)

---

## Phase 17: Performance & QA Final (Score 9.4 → 9.6+)

### What We're Doing
The final polish: performance optimizations, audit, and QA. Making sure everything is perfect before shipping.

### Tasks Recap
| Task | What | Impact |
|------|------|--------|
| 17.1 | useMemo in style objects | Reduce re-renders |
| 17.2 | RTE: reduce re-renders | Smoother editing |
| 17.3 | CLS audit | CLS < 0.05 |
| 17.4 | Bundle size check | No significant increase |
| 17.5 | Lighthouse audit | A11y ≥ 95, Perf ≥ 90 |
| 17.6 | Build + tests final | 351/351 passing |
| 17.7 | ROADMAP + STATE update | Documentation |
| 17.8 | Final atomic commit | Release tag |

### Design Decisions

#### Decision 1: useMemo — Which Style Objects?
Not all style objects need useMemo. Only those that:
1. Are computed from props/state
2. Are passed as props to child components
3. Are in components that re-render frequently

**Candidates for useMemo:**
```tsx
// ANTES: Recreated on every render
const formStyle: React.CSSProperties = { display: "grid", gap: "1.25rem" };

// DEPOIS: Only recreated if dependencies change
const formStyle = useMemo<React.CSSProperties>(() => ({
  display: "grid", gap: "1.25rem",
}), []);  // Empty deps = never changes
```

**NOT candidates (static const at module level):**
```tsx
// These are already optimal — created once at module load
const formStyle: React.CSSProperties = { display: "grid", gap: "1.25rem" };
```

**Key insight:** Most style objects in PsiLock are `const` at module level — already optimal. useMemo is only needed for inline styles inside component functions.

#### Decision 2: CLS Audit — What to Check?
Core Web Vitals: CLS (Cumulative Layout Shift) < 0.05

**Checklist:**
1. Images have width/height attributes (or aspect-ratio CSS)
2. Fonts use `font-display: swap` (already done — IBM Plex uses swap)
3. Dynamic content reserves space (skeleton loaders)
4. No content injected above existing content (toasts appear at bottom)
5. AutoSaveIndicator: transition on specific props (not "all") — done in 15.5

**Expected CLS:** < 0.01 (very low — PsiLock is mostly static content with gradual loading)

#### Decision 3: Lighthouse — Which Pages?
Test representative pages:
1. `/` (home/dashboard) — landing page
2. `/patients` — list page
3. `/patients/[id]` — detail page (most complex)
4. `/sessions/[id]/note` — editor page
5. `/agenda` — calendar page

**Target scores:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 90

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| useMemo adds complexity without benefit | Low | Low | Only apply where it matters |
| Bundle size increased significantly | Low | Medium | SVG icons are small (~2KB total) |
| Lighthouse score lower than expected | Medium | Medium | Fix issues iteratively |
| Tests break after 41 tasks | Low | High | Build + test after each task |

### Alternative Approaches Considered

**Approach A:** Skip performance optimization, focus on UX
- **Rejected:** Performance IS UX. A slow, janky app feels unpremium regardless of visual polish.
- **What we're doing:** Lightweight optimizations (useMemo, CLS check) — no heavy profiling needed.

**Approach B:** Use React.memo on all components
- **Rejected:** Premature optimization. Most components don't re-render frequently enough to benefit.
- **When to use:** If React DevTools Profiler shows unnecessary re-renders.

### Success Criteria
- [ ] `npx next build` ✅
- [ ] `pnpm test` ✅ 351/351
- [ ] CLS < 0.05 on all tested pages
- [ ] Lighthouse A11y ≥ 95 on all tested pages
- [ ] Lighthouse Performance ≥ 90
- [ ] Bundle size increase < 10KB vs baseline
- [ ] ROADMAP.md updated
- [ ] STATE.md updated

### Estimated Effort
- **Optimistic:** 20 minutes (most tasks are automated checks)
- **Realistic:** 35 minutes (Lighthouse testing + fixes if needed)
- **Pessimistic:** 60 minutes (if performance issues found)

---

## Overall Phase Summary

| Phase | Score Delta | Effort | Risk | Parallelizable |
|-------|------------|--------|------|----------------|
| **13: Foundation** | +1.0 | 35 min | Medium | No (sequential dependency) |
| **14: Migration** | +1.2 | 75 min | Medium | Yes (6 sub-tasks parallel) |
| **15: Polish** | +0.6 | 65 min | Low | Yes (12 sub-tasks parallel) |
| **16: UX Flows** | +0.4 | 50 min | Low-Med | Yes (7 sub-tasks parallel) |
| **17: QA** | +0.2 | 35 min | Low | No (depends on all above) |
| **TOTAL** | **+3.4** | **260 min** | **Controlled** | **Partial** |

## Execution Strategy Options

### Option A: Sequential (Safe, Slower)
Execute phases 13 → 14 → 15 → 16 → 17 in order.
- **Pros:** Each phase builds on previous. Easy to debug.
- **Cons:** ~4.3 hours total. More sessions needed.

### Option B: Parallel Within Phases (Fast, Complex)
Within each phase, run independent sub-tasks in parallel using agents.
- **Pros:** ~2.5 hours total. Fewer sessions.
- **Cons:** More complex coordination. Harder to debug if multiple tasks break.

### Option C: Hybrid (Recommended)
- Phase 13: Sequential (foundation must be solid)
- Phase 14: Parallel (6 sub-tasks, each independent)
- Phase 15: Parallel (12 sub-tasks, each independent)
- Phase 16: Sequential (some tasks depend on others)
- Phase 17: Sequential (QA must be last)

**Estimated total: ~3 hours with parallel execution.**

## Recommended Next Step

Start **Phase 13** (Foundation Tokens) with sequential execution. This is the foundation that everything else depends on. Once Phase 13 is done and verified, we can parallelize Phase 14 and 15 for maximum velocity.

**Command to start:** `Execute fase 13`
