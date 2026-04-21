# Roadmap: PsiVault v1.1 — Notificações Premium

**Milestone:** v1.1
**Phases:** 5 (Phase 16–20)
**Requirements covered:** 23/23

---

## Phase 16: Arquitetura de Notificações

**Goal:** Refatorar a base do sistema de notificações — tipos TypeScript, storage abstrato, e migrar de inline styles para CSS classes.

**Requirements:** ARCH-01, ARCH-02, ARCH-03, ARCH-04

**Success criteria:**
1. Interface `NotificationStorage` com métodos get/save/clear e implementação localStorage
2. Union discriminada `NotificationType` com 5 categorias tipadas (update, session_reminder, payment_pending, patient_noshow, birthday)
3. Hook `useNotifications` refatorado para usar storage abstrato
4. Zero inline styles nos componentes de notificação — tudo via CSS classes com design tokens
5. Testes existentes continuam passando

**Depends on:** Nenhum

---

## Phase 17: Top Bar Layout

**Goal:** Criar top bar fixa no topo da área de conteúdo (estilo Gmail/Notion) com busca, sino e avatar. Remover sino da sidebar.

**Requirements:** LAYOUT-01, LAYOUT-02, LAYOUT-03

**Success criteria:**
1. Top bar fixa visível em todas as páginas do vault com SearchBar, NotificationBell e avatar
2. Sino removido do header da sidebar (brandStyle)
3. Top bar responsiva: em mobile, sino e avatar visíveis, busca colapsável
4. Layout não quebra bottom nav existente
5. Sidebar mantém largura 240px e funcionalidade intacta

**Depends on:** Phase 16 (componentes refatorados)

---

## Phase 18: Tipos de Notificação e Ações

**Goal:** Implementar os 5 tipos de notificação com ícones SVG, cores, e ações contextuais distintas por tipo.

**Requirements:** NTYPE-01, NTYPE-02, NTYPE-03, NTYPE-04, NTYPE-05, NTYPE-06

**Success criteria:**
1. Tipo "update": ícone raio, cor accent, expande detalhes inline ao clicar
2. Tipo "session_reminder": ícone calendário, cor azul, navega para `/agenda`
3. Tipo "payment_pending": ícone cifrão, cor amber, navega para `/financeiro`
4. Tipo "patient_noshow": ícone alerta, cor rose, navega para `/patients/{id}`
5. Tipo "birthday": ícone presente, cor verde, navega para `/patients/{id}`
6. Cada tipo renderiza ícone SVG distinto e cor de fundo sutil diferente

**Depends on:** Phase 16 (tipos TypeScript)

---

## Phase 19: Dropdown Premium

**Goal:** Redesenhar o dropdown de notificações com agrupamento por data, timestamps relativos, animações, empty state, e header com ações.

**Requirements:** NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05, NOTIF-06, NOTIF-07

**Success criteria:**
1. Dropdown abre com animação scale+fade (transform origin top-right)
2. Notificações agrupadas por "Hoje", "Ontem", "Esta semana", "Anteriores" com headers visuais
3. Cada item mostra ícone, título, descrição truncada, e timestamp relativo ("há 2h", "há 3 dias")
4. Badge no sino com animação pulse ao receber nova notificação
5. Empty state com ícone de sino e mensagem "Tudo em dia"
6. Header com "Marcar todas como lidas" e "Limpar" funcionais
7. Fecha com click outside, Escape, ou botão X no header

**Depends on:** Phase 17 (top bar), Phase 18 (tipos de notificação)

---

## Phase 20: Interações e Polish

**Goal:** Finalizar interações avançadas — ações por clique, dismiss individual, transições read/unread, scroll otimizado.

**Requirements:** NACT-01, NACT-02, NACT-03, NACT-04

**Success criteria:**
1. Clicar em notificação: executa ação primária do tipo (navegar/expandir) e marca como lida
2. Botão dismiss (X) em cada notificação para remover individualmente com animação de slide-out
3. Transição visual suave entre read/unread (dot indicator + background fade)
4. Dropdown com scroll suave, max-height 400px, scrollbar customizada sutil
5. Build passa sem erros, zero regressões visuais

**Depends on:** Phase 19 (dropdown completo)

---

## Phase Summary

| # | Phase | Goal | Requirements | Criteria |
|---|-------|------|--------------|----------|
| 16 | Arquitetura de Notificações | Storage abstrato, tipos, CSS | ARCH-01..04 | 5 |
| 17 | Top Bar Layout | Top bar Gmail/Notion | LAYOUT-01..03 | 5 |
| 18 | Tipos de Notificação | 1/1 | Complete   | 2026-04-21 |
| 19 | Dropdown Premium | Redesign completo dropdown | NOTIF-01..07 | 7 |
| 20 | Interações e Polish | Ações, dismiss, transições | NACT-01..04 | 5 |

**Total:** 5 phases | 23 requirements | 28 success criteria
