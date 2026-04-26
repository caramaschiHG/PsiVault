# Phase 34: Feedback de Ação e Loading - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous execution)

<domain>
## Phase Boundary

Usuários recebem feedback visual calmo e imediato sobre o estado de suas ações. Toast animations, skeleton shimmer, button loading states, spinner, form error feedback.

</domain>

<decisions>
## Implementation Decisions

### Already Implemented (from Phases 32-35)
- Toast animations: `toastSlideIn` enter (200ms), `toastFadeOut` exit (300ms) in motion.css
- Skeleton shimmer: organic gradient at 1.6s in globals.css
- Spinner component: 3 sizes (sm/md/lg) in `spinner.tsx`
- Button component: `isLoading` prop with spinner
- Form error shake: `input-error` + `input-error-shake` classes

### Gap Focus
- Some vault forms use raw `<button>` without loading state wiring
- Document composer form (high-visibility user action) lacks submit loading feedback

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` component in `src/components/ui/button.tsx` with `isLoading` + `Spinner`
- `useFormStatus` from `react-dom` used in auth forms
- `useTransition` pattern used in agenda components

### Gaps Found
- `document-composer-form.tsx:118` — raw `<button type="submit">` without loading
- `documents/[documentId]/edit/page.tsx:88` — raw submit button without loading
- `archive-confirm/page.tsx` — raw submit buttons without loading

</code_context>

<specifics>
## Specific Ideas

- Wire `useFormStatus` or `useTransition` to key form submit buttons
- Prefer `useFormStatus` for Server Action forms (Child of `<form>` pattern)
- Keep changes minimal — most feedback infrastructure already exists

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
