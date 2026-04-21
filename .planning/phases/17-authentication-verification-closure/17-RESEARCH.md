# Phase 17: Top Bar Layout - Research

**Objective:** Research how to implement the Top Bar Layout (Phase 17) seamlessly into the existing architecture.

## 1. Current Architecture Analysis

### 1.1 Vault Layout (`src/app/(vault)/layout.tsx`)
O layout principal utiliza uma estrutura Flexbox horizontal (`shellStyle`):
- `aside.vault-sidebar`: Ocupa 240px, fixa.
- `main.vault-content`: Usa `flex: 1`, ocupando todo o restante.
- `BottomNav`: Navegação móvel presa na parte inferior.

O `NotificationBell` está atualmente no header da sidebar (`brandStyle`).
A `SearchBar` está no rodapé da sidebar (`sidebarSearchStyle`).

### 1.2 SearchBar Component (`src/app/(vault)/components/search-bar.tsx`)
- Já é um Client Component isolado (`"use client"`).
- O controle de responsividade no mobile (esconder input, virar lupa) precisa ser incorporado, já que a busca será movida do rodapé estático da sidebar para a Top Bar dinâmica.

## 2. Implementation Approach

### 2.1 Novo Componente: `TopBar`
Criar `src/app/(vault)/components/top-bar.tsx`.
- Este componente será montado dentro do `VaultLayout`, no início do `main.vault-content`.
- **Estilização:** CSS Classes no `globals.css` (ex: `.top-bar-container`, `.top-bar-search`, `.top-bar-actions`) ou styles inline no próprio layout para manter consistência com o `VaultLayout`.
- **Posição:** `position: sticky`, `top: 0`, `z-index: var(--z-header)` (que deve ser maior que os elementos do `children`, mas menor que modais).

### 2.2 Refatoração da SearchBar
- O componente `search-bar.tsx` precisa de props ou CSS media queries para se adaptar à versão mobile.
- Em desktop, limite máximo de largura (ex: `max-width: 480px`).
- Em mobile, o input pode ficar escondido e abrir quando houver foco ou click no ícone de lupa.
- **Dica técnica:** Como a UI deve ser responsiva, usar `@media (max-width: 768px)` nas classes da Search Bar no `globals.css`.

### 2.3 User Avatar Menu
- Atualmente não há Avatar no Vault. Devemos adicionar um mockup ou o Avatar real no `TopBar`.
- Se usarmos um `div` com as iniciais do usuário, usará cores da marca (`var(--color-accent)`).

## 3. Riscos & Mitigações
- **Z-Index:** O dropdown do sino (Phase 16) e o dropdown da busca não podem ser cortados pelo `overflow` da Top Bar. O `main.vault-content` não deve ter `overflow: hidden`.
- **Mobile BottomNav:** A `TopBar` não interfere na `BottomNav`, pois a bottom nav tem position fixed/sticky própria.

## 4. Dependencies
Nenhuma dependência externa. Usa os componentes React e tokens CSS existentes.

## Validation Architecture
- **Component Tests:** Validar que `TopBar` renderiza `SearchBar` e `NotificationBell`.
- **Layout Tests:** O layout não pode quebrar ao dar resize. A SearchBar deve ocupar a largura disponível até seu `max-width`.
