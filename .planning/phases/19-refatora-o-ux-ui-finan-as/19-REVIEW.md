---
phase: 19-refatora-o-ux-ui-finan-as
reviewed: 2026-04-22T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/app/(vault)/financeiro/components/charge-side-panel.tsx
  - src/app/(vault)/financeiro/page-client.tsx
  - src/app/(vault)/financeiro/page.tsx
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-04-22T00:00:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

The UI and UX refactoring for the financial module is quite robust and features nice touches like localized CSV export, safe rendering loops, and explicit avoidance of division by zero. However, the review found a critical architectural violation (bypassing the Repository pattern to call Prisma directly in a Server Component) and a critical focus-trap issue in the side panel that causes unpredictable focus jumps. Several warnings regarding error handling, state-preserving reloads, and input validation were also identified.

## Critical Issues

### CR-01: Architectural Violation — Direct Prisma Usage in Component

**File:** `src/app/(vault)/financeiro/page.tsx:52, 114`
**Issue:** The server component directly imports and uses `db.appointment.findMany`. The project rules explicitly state: "Nunca chamar Prisma direto em componentes ou actions". All database queries must be encapsulated within a domain repository (e.g., `getAppointmentRepository()`).
**Fix:**
```typescript
// Remove: import { db } from "@/lib/db";
// Use the repository pattern instead:
import { getAppointmentRepository } from "@/lib/appointments/store";

// Inside loadMonthBreakdown (approx line 52):
const appointmentRepo = getAppointmentRepository();
const appts = apptIds.length
  ? await appointmentRepo.findByIds(apptIds)
  : [];

// Inside FinanceiroPage (approx line 114):
const appointmentRepo = getAppointmentRepository();
const restOfMonth = await appointmentRepo.listScheduledInDateRange(workspaceId, now, monthEnd);
```

### CR-02: Focus Trap Unintentionally Steals Focus on Re-renders

**File:** `src/app/(vault)/financeiro/components/charge-side-panel.tsx:44-61`
**Issue:** The `useEffect` handling the focus trap includes `previousFocusRef.current?.focus()` in its cleanup function and depends on `handleKeyDown`. Because `handleKeyDown` depends on `onClose`, which is recreated on every render of the parent `FinanceiroPageClient`, the effect cleans up (stealing focus) and re-runs on every state update.
**Fix:** Separate the focus preservation logic from the event listener binding into two different effects:
```typescript
  // 1. Store and restore previous focus ONLY when drawer opens/closes
  useEffect(() => {
    if (!drawerId) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      drawerRef.current?.focus();
    });
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [drawerId]); // Only trigger when drawerId changes

  // 2. Handle key events separately
  useEffect(() => {
    if (!drawerId) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerId, handleKeyDown]);
```

## Warnings

### WR-01: Unvalidated URL Parameters Can Crash Server (NaN)

**File:** `src/app/(vault)/financeiro/page.tsx:67-68`
**Issue:** `parseInt(params.year, 10)` can result in `NaN` if the query param is not a valid number (e.g., `?year=abc`). This will propagate `NaN` to the `Date` constructors, leading to Prisma throwing an "Invalid value for DateTime filter" crash.
**Fix:**
```typescript
const parsedYear = params.year ? parseInt(params.year, 10) : NaN;
const year = isNaN(parsedYear) ? now.getFullYear() : parsedYear;

const parsedMonth = params.month ? parseInt(params.month, 10) : NaN;
const month = isNaN(parsedMonth) ? now.getMonth() + 1 : parsedMonth;
```

### WR-02: Missing Error Feedback for Quick Actions

**File:** `src/app/(vault)/financeiro/page-client.tsx:191-227`
**Issue:** Functions `handleQuickPay` and `handleUndoPay` lack handling for `!result.ok` or a surrounding `try/catch` to handle network issues. The user gets no feedback if the action silently fails.
**Fix:**
```typescript
      const result = await mod.markChargeAsPaidAction(chargeId, method);
      if (result.ok) {
        // ... success logic ...
      } else {
        showToast(result.error ?? "Erro ao registrar pagamento");
      }
    } catch (err) {
      showToast("Erro de conexão ao processar ação.");
    } finally {
```

### WR-03: Full Page Reload Instead of Next.js Soft Refresh

**File:** `src/app/(vault)/financeiro/page-client.tsx:154`
**Issue:** Using `window.location.reload()` forces a full browser reload, discarding all client-side state (like current tabs or open panels) and defeating the purpose of the App Router.
**Fix:**
```typescript
      if (result.ok) {
        closeDrawer();
        router.refresh(); // Soft refresh via Next.js router
      }
```

## Info

### IN-01: Repeated Fallback Logic for Patient Name

**File:** `src/app/(vault)/financeiro/page-client.tsx:261`
**Issue:** The logic `patient?.socialName ?? patient?.fullName ?? charge.patientId` is duplicated multiple times across the file (e.g., lines 261, 610).
**Fix:** Consider extracting this to a small helper function, e.g., `function getPatientDisplayName(p?: Patient, fallbackId?: string)` to keep the display name resolution DRY.