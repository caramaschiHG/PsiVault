# Phase 18 Research: Tipos de Notificação e Ações

## Objective
Identify existing code structures and CSS tokens necessary to implement the visual and behavioral requirements for the 5 notification types (update, session_reminder, payment_pending, patient_noshow, birthday), without creating technical debt or rewriting the Phase 16 architecture.

## Existing Implementation

### `src/components/ui/notification-bell.tsx`
- Currently renders a generic dropdown using classes like `.notif-item`, `.notif-item-body`, `.notif-item-title`, `.notif-item-desc`.
- Notifications only show the title and description, with a dot `notif-unread-dot` for unread status.
- Needs to be refactored to extract the individual notification rendering into a separate component, e.g., `<NotificationItem />`, or to handle rendering distinct layouts based on `n.type` as defined in `src/lib/notifications/types.ts`.

### CSS Tokens (`src/app/globals.css`)
We have an extensive set of semantic color tokens:
- **Accents:** `--color-accent` (#9a3412), `--color-rose` (#9f1239), `--color-forest` (#2d6a4f).
- **Semantic:** `--color-success-bg`, `--color-success-text`, `--color-error-bg`, `--color-warning-bg`.
- We can map these tokens to the 5 notification types to achieve the "fundo sutil" (subtle background) requirement:
  - **update**: `--color-accent` / `--color-accent-light` (bg)
  - **session_reminder**: Blue tokens (e.g. `--color-note-blue` or a new subtle blue token)
  - **payment_pending**: Amber/Warning tokens (`--color-warning-text` / `--color-warning-bg`)
  - **patient_noshow**: Rose/Error tokens (`--color-error-text` / `--color-error-bg`)
  - **birthday**: Green/Success tokens (`--color-success-text` / `--color-success-bg` or `--color-forest`)

### SVG Icons
The project uses `lucide-react` or inline SVGs. Since the user chose "Outline", standard `lucide-react` icons (which are outline by default) fit perfectly:
- `update`: `Zap`
- `session_reminder`: `Calendar`
- `payment_pending`: `DollarSign`
- `patient_noshow`: `AlertCircle` or `UserX`
- `birthday`: `Gift`

## Behavioral Requirements (Context)
- **Actions:** Clicking standard notifications must navigate in the same tab and immediately close the dropdown (call `setOpen(false)` inside `notification-bell.tsx`). 
- **Expansion (Accordion):** The `update` type needs an inline expansion mechanism. This requires internal state (e.g., `isExpanded`) within the individual notification item component.

## What is needed for the Plan
1. **Component Extraction:** Create a `NotificationItem` component (e.g., `src/components/ui/notification-item.tsx`) that takes an `AppNotification`, `markAsRead`, and a `closeDropdown` callback.
2. **Icon Mapping:** A utility or switch statement to map `notification.type` to the correct icon and CSS classes.
3. **CSS Updates:** Add specific background/border modifiers in `globals.css` (e.g., `.notif-item--update`, `.notif-item--birthday`) leveraging existing CSS variables + `bg-opacity-10`.
4. **Accordion Logic:** Implement conditional rendering inside `NotificationItem` for `notification.type === "update"` to toggle visibility of the `changelog` field.
