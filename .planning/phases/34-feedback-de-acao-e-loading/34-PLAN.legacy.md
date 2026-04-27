# Phase 34: Feedback de Ação e Loading — Plan

## Overview

Usuários recebem feedback visual calmo e imediato sobre o estado de suas ações.

## Changes

### 1. Reusable Form Submit Button
- **New file:** `src/components/ui/form-submit-button.tsx`
- Client component using `useFormStatus` from `react-dom`
- Shows `Spinner` + pending label when form is submitting
- Opacity 0.7 + cursor wait during pending state

### 2. Wire Loading States to Key Forms
- **File:** `src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx`
  - Replace raw `<button type="submit">` with `<FormSubmitButton>`
- **File:** `src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/page.tsx`
  - Replace raw submit button with `<FormSubmitButton>`
- **File:** `src/app/(vault)/patients/[patientId]/archive-confirm/page.tsx`
  - Replace all 3 raw submit buttons with `<FormSubmitButton>`

### Already Implemented (from Phases 32-35)
- Toast animations: `toastSlideIn` enter (200ms), `toastFadeOut` exit (300ms)
- Skeleton shimmer: organic gradient at 1.6s
- Spinner component: 3 sizes (sm/md/lg) in `spinner.tsx`
- Button component: `isLoading` prop with spinner
- Form error shake: `input-error` + `input-error-shake` classes

## Success Criteria Verification
- [x] Toasts entram com slide+fade e saem com fade — duração ≤300ms
- [x] Botões de Server Action exibem estado de loading visual
- [x] Skeletons exibem shimmer gradient orgânico
- [x] Spinner leve (SVG + CSS) disponível
- [x] Erros de formulário acionam border color transition e shake

## Test Plan
- `pnpm test` — 453 tests passing
- `pnpm build` — zero TypeScript errors
