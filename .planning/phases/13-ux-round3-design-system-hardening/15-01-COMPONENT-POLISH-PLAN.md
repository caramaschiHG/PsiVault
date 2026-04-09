# Fase 15: Component Polish & Acessibilidade — Execution Plan

## Objective
Elevar score de 8.4 para 9.0 através de polish visual completo e acessibilidade total em todos os componentes.

## Tasks Detail

### 15.1 RichTextEditor Toolbar: Focus/Hover/Active/Aria-Pressed

**File:** `src/components/ui/rich-text-editor.tsx`

**Changes:**
```tsx
// Toggle buttons (bold, italic, underline, h1, h2, paragraph, blockquote, alignment)
// need aria-pressed state tracking
const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

// Each button gets:
<button
  type="button"
  title={button.title}
  style={{
    ...toolbarButtonStyle,
    ...(isToggle && activeFormats.has(button.action) ? toolbarButtonActiveStyle : {}),
  }}
  aria-pressed={isToggle ? activeFormats.has(button.action) : undefined}
  className="rte-toolbar-btn"  // CSS class for hover/focus
  onClick={() => exec(button.action)}
>
```

**CSS to add (globals.css):**
```css
.rte-toolbar-btn {
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), transform 60ms ease;
}
.rte-toolbar-btn:hover {
  background-color: rgba(245, 240, 232, 1);
  border-color: rgba(120, 53, 15, 0.2);
}
.rte-toolbar-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
.rte-toolbar-btn:active {
  transform: scale(0.96);
}
.rte-toolbar-btn[aria-pressed="true"] {
  background-color: rgba(154, 52, 18, 0.08);
  border-color: var(--color-accent);
  color: var(--color-accent);
}
```

### 15.2 RichTextEditor: Emojis → SVG Icons

**File:** `src/components/ui/rich-text-editor.tsx`

**Icon mapping:**
| Label | Icon (Lucide style SVG) |
|-------|------------------------|
| `B` | `<Bold>` — **B** bold icon |
| `I` | `<Italic>` — *I* italic icon |
| `U` | `<Underline>` — U̲ underline icon |
| `H1` | `<Heading>` with 1 |
| `H2` | `<Heading>` with 2 |
| `P` | `<Pilcrow>` or `<Text>` |
| `• Lista` | `<List>` |
| `1. Lista` | `<ListOrdered>` |
| `""` | `<Quote>` |
| `Link` | `<Link>` |
| `↤` | `<AlignLeft>` |
| `↔` | `<AlignCenter>` |
| `↦` | `<AlignRight>` |
| `—` | `<Minus>` (horizontal rule) |
| `Limpar` | `<Eraser>` |
| `↺` | `<Undo>` |
| `↻` | `<Redo>` |

**Implementation:** Inline SVGs (no external dependency):
```tsx
function BoldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    </svg>
  );
}
```

### 15.3 AutoSaveIndicator: Emojis → SVG Icons

**File:** `src/components/ui/auto-save-indicator.tsx`

```tsx
// Replace:
// idle/saved: "✓" → CheckCircle icon
// saving: "⟳" → Loader icon (spinning)
// error: "!" → AlertTriangle icon

function CheckCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.6s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
```

### 15.4 ClinicalTimeline NoteBadge: Emoji → SVG

**File:** `src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx`

Replace `📝` with `<FileTextIcon />` (same SVG pattern as above).

### 15.5 AutoSaveIndicator: Specific Transition

**File:** `src/components/ui/auto-save-indicator.tsx`

```tsx
// ANTES
transition: "all 150ms ease"

// DEPOIS
transition: "opacity 150ms ease, background-color 150ms ease, color 150ms ease"
```

### 15.6 Tab: Hover State

**File:** `src/components/ui/tabs.tsx`

Add CSS (globals.css):
```css
.tab {
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.tab:hover:not(.tab--active) {
  background-color: rgba(146, 64, 14, 0.06);
}
```

### 15.7 ListItem: Hover Visual

**File:** `src/components/ui/list.tsx`

```tsx
// In interactive variant, add hoverStyle:
hoverStyle={{
  backgroundColor: "rgba(146, 64, 14, 0.04)",
}}
```

### 15.8 Template Cards: Hover/Press Feedback

**File:** `src/app/(vault)/sessions/[appointmentId]/note/components/note-composer-form.tsx`

Add CSS class `template-card` and in globals.css:
```css
.template-card {
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform 60ms ease;
}
.template-card:hover {
  border-color: rgba(146, 64, 14, 0.3);
  box-shadow: var(--shadow-xs);
}
.template-card:active {
  transform: scale(0.98);
}
```

### 15.9 KeyboardShortcutsModal: Focus Trap

**File:** `src/components/ui/keyboard-shortcuts-modal.tsx`

Implement focus trap:
```tsx
useEffect(() => {
  if (!open) return;
  const modal = document.querySelector('[data-modal-content]');
  if (!modal) return;
  
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  const trapFocus = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  };
  
  document.addEventListener('keydown', trapFocus);
  first?.focus();
  return () => document.removeEventListener('keydown', trapFocus);
}, [open]);
```

Also add `data-modal-content` attribute to modal content div.

### 15.10 Toast: Dismiss Button

**File:** Need to find toast provider component

Add dismiss button:
```tsx
<button
  onClick={() => dismissToast(toast.id)}
  style={{
    position: 'absolute', top: '0.5rem', right: '0.5rem',
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'var(--color-text-3)', padding: '0.25rem', borderRadius: 'var(--radius-sm)',
  }}
  aria-label="Fechar notificação"
>
  <XIcon size={14} />
</button>
```

### 15.11 NoteComposer Focus Mode: React State

**File:** `src/app/(vault)/sessions/[appointmentId]/note/components/note-composer-form.tsx`

```tsx
// ANTES (DOM manipulation)
document.querySelector<HTMLElement>(".vault-sidebar")?.classList.toggle("collapsed");

// DEPOIS: Use a callback/event emitter pattern
// The vault layout should expose a sidebar toggle via context or event
```

This requires coordination with the vault layout. May need a `SidebarContext` or a custom event:
```tsx
window.dispatchEvent(new CustomEvent('vault:sidebar-toggle', { detail: { collapsed: !focusMode } }));
```

### 15.12 Card Variants: Unify Radius/Shadow

Standardize all "card-like" components:

| Component | Current | Target |
|-----------|---------|--------|
| Card (default) | `--radius-lg` | ✅ Already correct |
| Card (raised) | `--radius-lg` | ✅ Already correct |
| HeroCard | `--radius-xl` | ✅ Already correct |
| Section (card) | `--radius-xl` | ✅ Already correct |
| StatCard | `--radius-lg` | ✅ Already correct |
| SnapshotCard | `--radius-lg` | ✅ Already correct |
| QuickNextSessionCard | `22px` inline | `var(--radius-lg)` |
| auth-card | `--radius-xl` | ✅ Already correct |
| List (bordered) | `--radius-lg` | ✅ Already correct |
| entryCard (timeline) | `16px` inline | `var(--radius-lg)` |
| DocumentRow | `12px` inline | `var(--radius-md)` |
| templateCard | `12px` inline | `var(--radius-md)` |
| RichTextEditor editor | `18px` inline | `var(--radius-lg)` |
| RichTextEditor toolbar | `14px` inline | `var(--radius-md)` |

## Verification

```bash
# Lighthouse accessibility ≥ 95
npx lhci autorun

# Zero emojis in TSX (except user content)
grep -rn '📝\|✓\|⟳\|!' src/ --include='*.tsx' | grep -v 'user content\|placeholder\|string literal'

# Build + tests
npx next build && pnpm test
```
