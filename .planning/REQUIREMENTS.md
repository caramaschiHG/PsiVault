# Requirements: PsiVault

**Defined:** 2026-04-21
**Core Value:** Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar

## v1.1 Requirements

Requirements for Notificações Premium milestone. Each maps to roadmap phases.

### Layout

- [ ] **LAYOUT-01**: Top bar fixa no topo da área de conteúdo com busca, sino e avatar do usuário
- [ ] **LAYOUT-02**: Sino de notificações removido da sidebar e posicionado no canto superior direito da top bar
- [ ] **LAYOUT-03**: Top bar responsiva (adapta para mobile sem quebrar bottom nav)

### Notificações — Dropdown

- [ ] **NOTIF-01**: Dropdown abre ao clicar no sino com animação suave (scale + fade)
- [ ] **NOTIF-02**: Notificações agrupadas por data (Hoje, Ontem, Esta semana, Anteriores)
- [ ] **NOTIF-03**: Cada notificação exibe ícone por tipo, título, descrição, e timestamp relativo ("há 2h")
- [ ] **NOTIF-04**: Badge de contagem no sino com animação de pulse ao receber nova notificação
- [ ] **NOTIF-05**: Empty state com ilustração e mensagem quando não há notificações
- [ ] **NOTIF-06**: Ações no header: "Marcar todas como lidas" e "Limpar todas"
- [ ] **NOTIF-07**: Fechar com click outside, Escape, ou botão X

### Notificações — Tipos e Ações

- [ ] **NTYPE-01**: Tipo "update" — changelog do sistema, ação: expandir detalhes inline
- [ ] **NTYPE-02**: Tipo "session_reminder" — lembrete de sessão próxima, ação: navegar para agenda
- [ ] **NTYPE-03**: Tipo "payment_pending" — pagamento pendente, ação: navegar para financeiro
- [ ] **NTYPE-04**: Tipo "patient_noshow" — paciente não compareceu, ação: abrir perfil do paciente
- [ ] **NTYPE-05**: Tipo "birthday" — aniversário de paciente, ação: abrir perfil do paciente
- [ ] **NTYPE-06**: Cada tipo tem ícone SVG, cor, e ação contextual distintos

### Notificações — Interação

- [ ] **NACT-01**: Clicar em notificação executa ação primária (navegar, expandir) e marca como lida
- [ ] **NACT-02**: Swipe ou botão dismiss para remover notificação individual
- [ ] **NACT-03**: Transição visual read/unread com dot indicator e background sutil
- [ ] **NACT-04**: Scroll suave no dropdown com max-height e overflow controlado

### Arquitetura

- [ ] **ARCH-01**: Interface abstrata de NotificationStorage (get, save, clear) com implementação localStorage
- [ ] **ARCH-02**: Tipos TypeScript completos para cada categoria de notificação com union discriminada
- [ ] **ARCH-03**: Hook useNotifications refatorado para usar storage abstrato
- [ ] **ARCH-04**: Zero inline styles — usar CSS modules ou classes com design tokens existentes

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Server-side Notifications

- **SRVN-01**: Migrar storage de localStorage para Supabase real-time
- **SRVN-02**: Push notifications via Web Push API
- **SRVN-03**: Email notifications para eventos críticos
- **SRVN-04**: Notification preferences (quais tipos receber, frequência)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Supabase real-time notifications | Será v1.2, após validar UX client-side |
| Web Push API | Complexidade alta, não essencial para v1.1 |
| Email notifications | Requer infraestrutura de email |
| Backend API para notificações | Manter client-side por enquanto |
| Notification sounds | Over-engineering para contexto clínico |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 16 | Pending |
| ARCH-02 | Phase 16 | Pending |
| ARCH-03 | Phase 16 | Pending |
| ARCH-04 | Phase 16 | Pending |
| LAYOUT-01 | Phase 17 | Pending |
| LAYOUT-02 | Phase 17 | Pending |
| LAYOUT-03 | Phase 17 | Pending |
| NTYPE-01 | Phase 18 | Pending |
| NTYPE-02 | Phase 18 | Pending |
| NTYPE-03 | Phase 18 | Pending |
| NTYPE-04 | Phase 18 | Pending |
| NTYPE-05 | Phase 18 | Pending |
| NTYPE-06 | Phase 18 | Pending |
| NOTIF-01 | Phase 19 | Pending |
| NOTIF-02 | Phase 19 | Pending |
| NOTIF-03 | Phase 19 | Pending |
| NOTIF-04 | Phase 19 | Pending |
| NOTIF-05 | Phase 19 | Pending |
| NOTIF-06 | Phase 19 | Pending |
| NOTIF-07 | Phase 19 | Pending |
| NACT-01 | Phase 20 | Pending |
| NACT-02 | Phase 20 | Pending |
| NACT-03 | Phase 20 | Pending |
| NACT-04 | Phase 20 | Pending |

**Coverage:**
- v1.1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-21*
*Last updated: 2026-04-21 after initial definition*
