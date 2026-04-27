# Roadmap: PsiVault

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-03-15)
- ✅ **v1.1 Notifications** - Phases 13-16 (shipped 2026-03)
- ✅ **v1.2 Finance** - Phases 17-22 (shipped 2026-04)
- ✅ **v1.3 Performance** - Phases 23-26 (shipped 2026-04-22)
- ✅ **v1.4 Performance Profunda** - Phases 27-31 (shipped 2026-04-23)
- ✅ **v1.5 Motion & Feel** - Phases 32-35 (shipped 2026-04-23)
- 🚧 **v1.6 Documentos** - Phases 37-42 (in progress)
- 📋 **v2.0 Multi-Agent & Calm UX** - Phases 43-49 (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) - SHIPPED 2026-03-15</summary>

### Phase 1: Design System Foundation
**Goal**: Sistema de design tokens e componentes base
**Plans**: 3 plans

Plans:
- [x] 01-01: Design tokens (cores, radius, shadows, spacing)
- [x] 01-02: Component library base
- [x] 01-03: Sidebar navigation

### Phase 2: Accessibility & Icons
**Goal**: WCAG 2.1 AA compliance e SVG icon system
**Plans**: 2 plans

Plans:
- [x] 02-01: Focus states, aria, keyboard nav
- [x] 02-02: SVG icon system

### Phase 3: Notifications v1
**Goal**: Notification bell básico com localStorage
**Plans**: 2 plans

Plans:
- [x] 03-01: Notification bell UI
- [x] 03-02: localStorage storage abstraction

</details>

<details>
<summary>✅ v1.1-v1.5 (Phases 13-35) - SHIPPED</summary>

### Phase 13-16: Notifications v2
**Goal**: Top bar, dropdown, ações contextuais
**Status**: Complete

### Phase 17-22: Finance
**Goal**: Módulo financeiro completo
**Status**: Complete

### Phase 23-26: Performance
**Goal**: Eliminar lentidão sistêmica
**Status**: Complete

### Phase 27-31: Performance Profunda
**Goal**: CWV, bundle, streaming
**Status**: Complete

### Phase 32-35: Motion & Feel
**Goal**: Motion tokens, micro-interações, animações
**Status**: Complete

</details>

### 🚧 v1.6 Documentos — Workflow Clínico Impecável (In Progress)

**Milestone Goal:** Transformar a experiência de documentação clínica em workflow fluido e clinicamente maduro

#### Phase 37: Foundation & Migration
**Goal**: Schema seguro, domain model com ciclo de vida, migration zero-downtime
**Depends on**: Phase 35
**Requirements**: TIME-01, TIME-02, NOTE-01
**Plans**: 3 plans

Plans:
- [ ] 37-01: Schema extension para document lifecycle
- [ ] 37-02: Domain model com estados (draft→finalized→signed→delivered)
- [ ] 37-03: Migration zero-downtime

#### Phase 38: Estados e Rascunho Server-Side
**Goal**: Ciclo de vida completo com auto-save server-side
**Depends on**: Phase 37
**Requirements**: DOCM-01, DOCM-02
**Plans**: 3 plans

Plans:
- [ ] 38-01: Server-side auto-save com debounce
- [ ] 38-02: State machine para document lifecycle
- [ ] 38-03: Audit trail para transições de estado

#### Phase 39: Editor Unificado e Preview A4
**Goal**: Composer contextual com layout A4 e preview PDF
**Depends on**: Phase 38
**Requirements**: DOCM-01, DOCM-02
**Plans**: 2 plans

Plans:
- [x] 39-01: RichTextEditor contextual por tipo de documento
- [x] 39-02: Preview A4 com watermark por status

#### Phase 40: Integração com Atendimentos
**Goal**: Ligação appointment-document com pre-fill contextual
**Depends on**: Phase 37
**Requirements**: FLOW-01, FLOW-02
**Plans**: 3 plans

Plans:
- [x] 40-01: Schema e repository para appointment-document link
- [x] 40-02: UI de integração na página de atendimento
- [ ] 40-03: Pre-fill contextual de dados do paciente

#### Phase 41: Dashboard e Navegação
**Goal**: /documentos global com filtros, breadcrumbs, tabs
**Depends on**: Phase 39
**Requirements**: DASH-01, DASH-02, NAV-01, NAV-02
**Plans**: 3 plans

Plans:
- [ ] 41-01: Dashboard /documentos com filtros
- [ ] 41-02: Breadcrumbs hierárquicos
- [ ] 41-03: Tabs no perfil do paciente

#### Phase 42: Polish e Cleanup
**Goal**: Remover legado, zero regressão, audit trail completo
**Depends on**: Phase 40, Phase 41
**Requirements**: QUICK-01, QUICK-02
**Plans**: 2 plans

Plans:
- [ ] 42-01: Remover código legado de documentos
- [ ] 42-02: QA completo e audit trail

### 📋 v2.0 Multi-Agent Architecture & Calm UX (Planned)

**Milestone Goal:** Transformar PsiVault em plataforma com agentes inteligentes operando em background, aplicando Calm Technology e UX evidence-based

#### Phase 43: Arquitetura Multi-Agent Foundation
**Goal**: Sistema de orquestração com contextos isolados e filas de tarefas
**Depends on**: Phase 42
**Requirements**: ARCH-01, ARCH-02
**Success Criteria**:
  1. Cada agente opera em processo isolado com própria fila
  2. Sistema de priorização de interrupções implementado (crítico > alto > médio > baixo)
  3. Agentes podem ser registrados e desregistrados dinamicamente
**Plans**: 3 plans

Plans:
- [ ] 43-01: Definir interface base de agente e sistema de registro
- [ ] 43-02: Implementar fila de tarefas com priorização
- [ ] 43-03: Criar orquestrador com lifecycle management

#### Phase 44: Agente de Agenda & Lembretes
**Goal**: Detecção de padrões, lembretes proativos, otimização de horários
**Depends on**: Phase 43
**Requirements**: AGEND-01, AGEND-02, AGEND-03, AGEND-04
**Success Criteria**:
  1. Sistema detecta padrão de faltas e exibe alerta periférico no card do paciente
  2. Lembretes são enviados em batch diário, nunca durante sessão
  3. Sugestão de horários aparece como badge sutil na agenda
  4. Resumo do Dia é exibido após último atendimento
**Plans**: 4 plans

Plans:
- [ ] 44-01: Agente de detecção de padrões de faltas
- [ ] 44-02: Sistema de lembretes com batching
- [ ] 44-03: Algoritmo de sugestão de horários
- [ ] 44-04: Resumo do Dia com notificações adiadas

#### Phase 45: Calm UX — Modo Foco & Tipografia
**Goal**: Modo foco para escrita clínica e largura otimizada de editor
**Depends on**: Phase 42
**Requirements**: CALM-01, CALM-02
**Success Criteria**:
  1. Usuário ativa modo foco e sidebar/top-bar/notificações desaparecem
  2. Editor de notas tem largura máxima de ~70ch
  3. Transição para modo foco é suave (200ms ease-out)
  4. Modo foco respeita prefers-reduced-motion
**Plans**: 2 plans

Plans:
- [ ] 45-01: Implementar modo foco com toggle global
- [ ] 45-02: Configurar largura máxima do editor e testar legibilidade

#### Phase 46: Calm UX — Tema & Hierarquia de Notificações
**Goal**: Light mode default, dark mode manual, hierarquia de interrupção documentada
**Depends on**: Phase 45
**Requirements**: CALM-03, CALM-04, CALM-05
**Success Criteria**:
  1. Novos usuários veem light mode por padrão
  2. Toggle manual entre light/dark sem dependência do OS
  3. Nenhum popup/modal durante sessão marcada como "em andamento"
  4. Hover states e placeholders passam em WCAG 2.1 AA em ambos os temas
**Plans**: 3 plans

Plans:
- [ ] 46-01: Implementar light mode como default com toggle manual
- [ ] 46-02: Documentar e implementar hierarquia de interrupção
- [ ] 46-03: Auditoria de contraste WCAG AA em ambos os temas

#### Phase 47: Interface de Monitoramento de Agentes
**Goal**: Dashboard em /settings/agentes para controle de agentes
**Depends on**: Phase 43
**Requirements**: ARCH-04
**Success Criteria**:
  1. Usuário vê lista de agentes com status (online/offline/paused)
  2. Cada agente tem controle de intensidade (desligado/silencioso/normal)
  3. Logs recentes visíveis por agente
  4. Configurações persistem por workspace
**Plans**: 2 plans

Plans:
- [ ] 47-01: UI de monitoramento de agentes em /settings
- [ ] 47-02: Persistência de configurações e logs por workspace

#### Phase 48: Offline Fallback & Sync
**Goal**: Fallback graceful quando offline com local cache e retry queue
**Depends on**: Phase 43
**Requirements**: ARCH-03
**Success Criteria**:
  1. Ações pendentes são armazenadas em local cache quando offline
  2. Retry queue processa com backoff exponencial na reconexão
  3. Sync automático restaura estado consistente
  4. Usuário vê indicador sutil de status de conexão
**Plans**: 2 plans

Plans:
- [ ] 48-01: Implementar local cache e retry queue
- [ ] 48-02: Sync automático e indicador de status

#### Phase 49: Integração & Polish v2.0
**Goal**: Integrar todos os sistemas, remover dívida de design, validar Calm UX
**Depends on**: Phase 44, Phase 46, Phase 47, Phase 48
**Requirements**: AGEND-04, CALM-04, ARCH-01
**Success Criteria**:
  1. Todos os agentes operam sem conflitos
  2. Nenhuma regressão nos 453 testes existentes
  3. DESIGN.md atualizado com padrões v2.0
  4. Audit trail cobre ações de agentes
**Plans**: 2 plans

Plans:
- [ ] 49-01: Integração end-to-end e testes de agentes
- [ ] 49-02: Polish visual, atualização de DESIGN.md, QA final

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design System | v1.0 | 3/3 | Complete | 2026-03-15 |
| 2. Accessibility | v1.0 | 2/2 | Complete | 2026-03-15 |
| 3. Notifications v1 | v1.0 | 2/2 | Complete | 2026-03-15 |
| 13-16. Notifications v2 | v1.1 | 4/4 | Complete | 2026-03 |
| 17-22. Finance | v1.2 | 6/6 | Complete | 2026-04 |
| 23-26. Performance | v1.3 | 4/4 | Complete | 2026-04-22 |
| 27-31. Performance Deep | v1.4 | 5/5 | Complete | 2026-04-23 |
| 32-35. Motion & Feel | v1.5 | 4/4 | Complete | 2026-04-23 |
| 37. Foundation | v1.6 | 0/3 | Not started | - |
| 38. Draft States | v1.6 | 0/3 | Not started | - |
| 39. Editor A4 | v1.6 | 2/2 | Complete | 2026-04-26 |
| 40. Appointment Integration | v1.6 | 2/3 | In progress | - |
| 41. Dashboard | v1.6 | 0/3 | Not started | - |
| 42. Polish | v1.6 | 0/2 | Not started | - |
| 43. Agent Foundation | v2.0 | 0/3 | Not started | - |
| 44. Agenda Agent | v2.0 | 0/4 | Not started | - |
| 45. Focus Mode | v2.0 | 0/2 | Not started | - |
| 46. Theme & Notifications | v2.0 | 0/3 | Not started | - |
| 47. Agent Monitor | v2.0 | 0/2 | Not started | - |
| 48. Offline Sync | v2.0 | 0/2 | Not started | - |
| 49. Integration | v2.0 | 0/2 | Not started | - |
