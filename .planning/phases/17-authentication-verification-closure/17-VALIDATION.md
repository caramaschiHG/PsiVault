---
phase: 17
slug: authentication-verification-closure
date: 2026-04-21
---

# Validation Strategy: Phase 17

## Verification Criteria

1. **Top Bar Existência e Posição**
   - O `main` ou layout container deve incluir a `<TopBar />` como primeiro elemento visual e usar `position: sticky`.
   - A barra deve ficar visível independente do scroll vertical.
2. **Migração dos Componentes**
   - `NotificationBell` deve estar na `<TopBar />`.
   - `SearchBar` deve estar na `<TopBar />` e removida da sidebar.
3. **Responsividade**
   - Em telas estreitas (ex: mobile), a `SearchBar` deve colapsar ou ocupar espaço reduzido sem quebrar a flexbox.
   - O avatar deve estar renderizado junto ao sino de notificação.

## Acceptance Criteria
- As classes e estilos aplicados à Top Bar e à SearchBar em mobile devem obedecer às `var(--*)` do design system do projeto em `globals.css`.
- O layout geral do `VaultLayout` deve continuar renderizando a `BottomNav` corretamente em mobile.
- A navegação global (sidebar) não deve estar quebrada por remoção acidental de estilos.
