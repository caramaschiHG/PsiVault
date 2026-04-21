---
phase: 17
wave: 1
depends_on: []
files_modified:
  - src/app/(vault)/components/top-bar.tsx
  - src/app/(vault)/components/search-bar.tsx
  - src/app/(vault)/layout.tsx
  - src/app/globals.css
autonomous: true
---

# Phase 17: Top Bar Layout - Plan

## Phase Goal
Criar top bar fixa no topo da área de conteúdo (estilo Gmail/Notion) com busca, sino e avatar. Remover sino da sidebar.

## Verification
- **Goal verification**: `LAYOUT-01`, `LAYOUT-02`, `LAYOUT-03` covered.
- **must_haves**: 
  - Top Bar uses `position: sticky; top: 0`
  - Top Bar renders SearchBar and NotificationBell
  - Sidebar no longer has these components.

## Tasks

<task>
  <id>1</id>
  <title>Create TopBar and Update Vault Layout</title>
  <description>Implement the new Top Bar layout by migrating components out of the sidebar and establishing the new 3-column sticky header.</description>
  <requirements>LAYOUT-01, LAYOUT-02, LAYOUT-03</requirements>
  <type>execute</type>

  <read_first>
    - src/app/(vault)/layout.tsx
    - src/app/(vault)/components/search-bar.tsx
    - src/components/ui/notification-bell.tsx
    - src/app/globals.css
  </read_first>

  <action>
    1. Update `src/app/globals.css` to append new utility classes at the bottom:
       ```css
       /* --- TOP BAR (Phase 17) --- */
       .top-bar {
         position: sticky;
         top: 0;
         z-index: var(--z-header);
         display: flex;
         align-items: center;
         justify-content: space-between;
         height: 64px;
         padding: 0 1.5rem;
         background: var(--color-surface-0);
         border-bottom: 1px solid var(--color-border);
       }
       .top-bar-left {
         flex: 1;
         min-width: 0;
       }
       .top-bar-center {
         flex: 2;
         max-width: 480px;
         display: flex;
         justify-content: center;
         margin: 0 1rem;
       }
       .top-bar-right {
         flex: 1;
         display: flex;
         align-items: center;
         justify-content: flex-end;
         gap: 1rem;
       }
       .avatar-placeholder {
         width: 32px;
         height: 32px;
         border-radius: 50%;
         background: var(--color-surface-2);
         display: flex;
         align-items: center;
         justify-content: center;
         font-size: 0.8rem;
         font-weight: 600;
         color: var(--color-text-2);
         cursor: pointer;
         transition: background 150ms ease;
       }
       .avatar-placeholder:hover {
         background: var(--color-surface-3);
       }
       
       /* Responsiveness for Search */
       @media (max-width: 768px) {
         .top-bar-center {
           max-width: 180px;
         }
       }
       ```

    2. Edit `src/app/(vault)/components/search-bar.tsx`:
       - Find `const containerStyle: React.CSSProperties = { position: "relative" };`
       - Change it to: `const containerStyle: React.CSSProperties = { position: "relative", width: "100%" };` so it fills the `.top-bar-center` container.

    3. Create `src/app/(vault)/components/top-bar.tsx` with the following content:
       ```tsx
       "use client";
       
       import { SearchBar } from "./search-bar";
       import { NotificationBell } from "@/components/ui/notification-bell";
       
       export function TopBar() {
         return (
           <header className="top-bar">
             <div className="top-bar-left">
               {/* Reserved for breadcrumbs/page titles */}
             </div>
             
             <div className="top-bar-center">
               <SearchBar />
             </div>
             
             <div className="top-bar-right">
               <NotificationBell />
               <div className="avatar-placeholder" aria-label="User menu">U</div>
             </div>
           </header>
         );
       }
       ```

    4. Edit `src/app/(vault)/layout.tsx`:
       - Add import: `import { TopBar } from "./components/top-bar";`
       - Remove `<NotificationBell />` from the `<div style={brandStyle}>` block.
       - Remove `<div style={sidebarSearchStyle}> <SearchBar /> </div>` from the bottom of the `<aside>`.
       - Render `<TopBar />` inside the `<main id="main-content" className="vault-content" style={contentStyle}>` block, right above the `<ToastProvider>`.
  </action>

  <acceptance_criteria>
    - `src/app/(vault)/components/top-bar.tsx` is created and contains `SearchBar` and `NotificationBell`.
    - `src/app/globals.css` contains `.top-bar` with `position: sticky`.
    - `src/app/(vault)/layout.tsx` does NOT contain `<SearchBar />` in the `aside`.
    - `src/app/(vault)/layout.tsx` does NOT contain `<NotificationBell />` in the `aside`.
    - `src/app/(vault)/layout.tsx` contains `<TopBar />` in the `main` tag.
    - `src/app/(vault)/components/search-bar.tsx` has `width: "100%"` in `containerStyle`.
  </acceptance_criteria>
</task>
