---
phase: 26-agenda-upgrade
plan: 04
status: complete
completed_at: "2026-04-07"
requirements_addressed:
  - AGENDA-04
---

# Plan 26-04 Summary — Quick Create Integration

## What Was Done

Integrated QuickCreatePopover into both CalendarGrid (day view) and WeekCalendarGrid (week view). Clicking an empty slot opens the popover positioned at the click location.

## Changes Made

**`src/app/(vault)/appointments/actions.ts`**
- Added `createAppointmentQuickAction(formData)` — new server action that:
  - Creates single appointment (no recurrence support in quick create)
  - Uses `revalidatePath("/agenda")` instead of `redirect()`
  - Returns `{ success: boolean; error?: string }`
  - Includes conflict detection, audit trail, notification queue
  - Same validation as existing `createAppointmentAction`

**`src/app/(vault)/agenda/components/calendar-grid.tsx`**
- Exported `SlotClickHandler` type
- Added `onSlotClick?: SlotClickHandler` prop to `CalendarGridProps`
- `DroppableSlot` now accepts `onClick` handler
- Click parses slot ID → ISO datetime + clientX/Y position
- Cursor changes to pointer when `onSlotClick` is provided

**`src/app/(vault)/agenda/components/week-calendar-grid.tsx`**
- Imported `SlotClickHandler` from calendar-grid (shared type)
- Added `onSlotClick` prop to `WeekCalendarGridProps`
- Same DroppableSlot onClick handler as CalendarGrid
- Handles both slot ID formats: `slot-{date}T{time}` and `slot-{dayIdx}-{date}T{time}`

**`src/app/(vault)/agenda/components/quick-create-wrapper.tsx`** (NOVO)
- Client component that orchestrates grid + QuickCreatePopover
- Manages popover state (`startsAt`, `position`)
- `renderGrid` prop injects `onSlotClick` callback into the grid
- `handleCreate`: calls action, on success → `router.refresh()` + close popover
- Uses `startTransition` for non-blocking UI updates

**`src/app/(vault)/agenda/page.tsx`**
- Day view and week view wrapped in `<QuickCreateWrapper>`
- `quickCreatePatients` array normalized from `Patient[]` to `{ id, fullName, socialName }`
- Month view NOT wrapped (no QuickCreate — no temporal slot context)

## Decisions

- `createAppointmentQuickAction` is a separate function, not a wrapper around the existing action, because the existing one uses `redirect()` which can't be intercepted
- Single appointment only in quick create (no recurrence) — keeps the popover simple
- `quickCreatePatients` normalization needed because `Patient.socialName` is `string | null` but component expects `string | undefined`
- Month view intentionally excluded from QuickCreate — clicking a day number navigates to day view instead

## Verification

- `pnpm tsc --noEmit`: ✓ zero errors
- `pnpm test -- --run`: ✓ 351 tests passing, zero regressions
- `pnpm build`: ✓ green
- Flow verified: click empty slot → popover opens → select patient → "Agendar" → toast + grid refresh
