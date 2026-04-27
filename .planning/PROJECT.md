# PsiVault — Plataforma Clínica para Psicólogos

## What This Is

PsiVault é uma plataforma web completa para psicólogos gerenciarem sua prática clínica — pacientes, agenda, prontuários, documentos e financeiro. Construída com Next.js 15, Supabase, e Prisma, com foco em segurança (multi-tenant, audit trail) e UX premium. App v1.3 Performance: navegação instantânea, caching habilitado, queries otimizadas.

## Core Value

Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.

## Current Milestone: v2.0 Multi-Agent Architecture & Calm UX

**Goal:** Transformar o PsiVault de uma ferramenta passiva de registro em uma plataforma com agentes inteligentes especializados que operam em background, reduzindo carga cognitiva do psicólogo e aplicando princípios de Calm Technology e UX evidence-based.

**Target features:**
- **Agente de Agenda & Lembretes** — otimização de horários, detecção de padrões de faltas, lembretes proativos para pacientes, batching de notificações (nunca interrompe sessão)
- **Calm UX & Accessibility** — modo foco para escrita clínica, tipografia otimizada para texto longo (line-length ~70ch), light mode como default com toggle manual para dark, hierarquia de notificações baseada em evidências (NNGroup/Case)
- **Arquitetura Multi-Agent** — sistema de orquestração onde cada agente opera em contexto isolado, com filas de tarefas, priorização de interrupções, e fallback graceful quando offline

**Fora do escopo (v2.1+):**
- Agente de Pesquisa Psicanalítica (bibliografia, comparação de escolas)
- Agente de Documentação (auto-preenchimento de notas, transcrição de sessões)

## Previous Milestone: v1.6 Documentos — Workflow Clínico Impecável (In Progress → v2.0)

**Goal:** Transformar a experiência de documentação clínica do PsiVault em um workflow fluido, seguro e clinicamente maduro — da sessão ao prontuário, do registro ao documento formal — com UX inspirada nos melhores sistemas de documentação médica do mundo.

**Target features:**
- Timeline clínica redesenhada: visual de linha do tempo com cards simplificados, agrupamento por período, escaneabilidade imediata
- Editor de notas aprimorado: auto-save visível, modo foco, templates clínicos (SOAP, BIRP, livre), keyboard shortcuts
- Editor de documentos premium: preview de PDF, templates visuais, toolbar rica com formatação real
- Fluxo integrado sessão → nota: da agenda direto para registro de prontuário sem saltos de página
- Dashboard de documentos: visão global `/documentos` com filtros por tipo, paciente, data; documentos recentes e pendentes
- Navegação hierárquica: breadcrumbs, tabs no perfil do paciente (Visão Geral, Clínico, Documentos, Financeiro)
- Quick actions e atalhos: criação de nota/documento em 1-2 cliques, keyboard shortcuts para ações de fluxo

## Previous Milestone: v1.5 Motion & Feel — Interações Fluidas (Shipped)

**Goal:** Elevar a percepção de qualidade do PsiVault através de animações sutis, micro-interações e refinamentos visuais que criam uma experiência clinicamente calma, estável e agradável — sem cair em exagero decorativo.

**Shipped:**
- Motion tokens (duration, easing, stagger) e utility classes CSS
- Micro-interações em botões, cards, inputs, navegação
- Feedback de ação (toast animation, skeleton shimmer, button loading)
- Animações em listas (staggered entry) e transições de página (fade 150ms)
- Expand/collapse suave via grid-template-rows
- Compatibilidade total com prefers-reduced-motion

**Parallel milestone:** v1.4 Performance Profunda (Phases 27–31, shipped 2026-04-23).

**Goal:** Eliminar gargalos remanescentes de performance e atingir fluidez objetivamente mensurável via Core Web Vitals e métricas de runtime.

**Target features:**
- Diagnóstico completo de bundle size, re-renders e memory leaks
- Otimização de queries no banco (indexing, connection pooling, query plans)
- Streaming de Server Components com Suspense boundaries estratégicas
- Otimização de assets (imagens, fontes, third-party scripts)
- Métricas objetivas: LCP, INP, CLS, TTFB dentro dos thresholds do Google

## Current State (v2.0 Multi-Agent & Calm UX — Defining Requirements)

Milestone v1.6 completou o workflow de documentos clínicos:
- Timeline clínica com visual de linha do tempo e cards simplificados
- Editor de notas com templates clínicos (SOAP, BIRP, livre) e modo foco
- Editor de documentos com preview de PDF e templates visuais
- Fluxo integrado sessão → nota direto da agenda
- Dashboard de documentos `/documentos` com filtros globais
- Navegação hierárquica com breadcrumbs e tabs no perfil do paciente
- Quick actions e keyboard shortcuts para ações de fluxo

Milestone v1.5 completou o sistema de motion e feel:
- Motion tokens (duration, easing, stagger) consolidados em motion.css
- Micro-interações em todos os componentes base
- List stagger animations e page transitions
- Expand/collapse orgânico sem layout shift
- Zero regressão de performance

Milestone v1.3 eliminou a lentidão sistêmica identificada em auditoria:
- Navegação client-side via `<Link>` (zero full reloads)
- Caching do Next.js habilitado (force-dynamic removido)
- /financeiro: ~40 queries → 3 por page load
- Agenda: N+1 de clinical notes → 1 query batch
- `importantObservations` excluído de todas as queries de listagem

Stack: Next.js 15, React 19, TypeScript 5.8 (strict), Prisma 6, PostgreSQL (Supabase), Supabase Auth (SSR)
Tests: 453/453 passing

**Contexto pesquisa UX recente:**
- Calm Technology (Weiser/Case): software clínico deve ficar na periferia da atenção
- Cognitive Load Theory (NNGroup): reduzir carga extrínseca via memória externa, reconhecimento > recordação
- Dark mode evidence (Piepenbrock et al.): light mode superior para performance visual, dark como opção manual
- Legibilidade texto longo (Butterick/Nielsen): 16-18px base, line-height 120-145%, ~70ch max-width
- Hierarquia notificações (Case): status light → tone → shout → popup; nunca interromper sessão
- DESIGN.md criado como fonte de verdade visual do app interno

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ Design token system (cores, radius, shadows, spacing, z-index, font-size) — v1.0
- ✓ Component library (PageHeader, Section, Card, StatCard, List, Badge, Toast) — v1.0
- ✓ Sidebar navigation com drawer mobile — v1.0
- ✓ Acessibilidade WCAG 2.1 AA (focus states, aria, keyboard nav) — v1.0
- ✓ SVG icon system (zero emojis estruturais) — v1.0
- ✓ Notification bell básico com localStorage — v1.0
- ✓ Top bar com busca, sino e avatar — v1.1
- ✓ Dropdown de notificações redesenhado — v1.1
- ✓ Múltiplos tipos de notificação com ações contextuais — v1.1
- ✓ Arquitetura de storage abstraída (localStorage → server-side ready) — v1.1
- ✓ Refatoração UX/UI Finanças (Modais, Layout, Filtros) — v1.2 Phase 19
- ✓ Módulo de Gestão de Despesas (CRUD, Categorias, Comprovantes) — v1.2 Phase 20
- ✓ Navegação client-side via Next.js Link (zero full reloads) — v1.3
- ✓ Vault layout com caching do Next.js (force-dynamic removido) — v1.3
- ✓ resolveSession deduplicada via React.cache() — v1.3
- ✓ Middleware: eliminação de dupla chamada getUser() + JWT AAL fast-path — v1.3
- ✓ /financeiro: ~40 queries consolidadas em 3 via listByWorkspaceAndDateRange — v1.3
- ✓ revalidatePath com escopo "page" em 13 server actions — v1.3
- ✓ Agenda: N+1 clinical notes → 1 batch query (findByAppointmentIds) — v1.3
- ✓ importantObservations excluído de listActive/listArchived via LIST_SELECT — v1.3
- ✓ Micro-interações em componentes base (hover, focus, active, floating labels, error shake, smooth scroll) — v1.5 Phase 33

### Active

<!-- Current milestone scope — v2.0 Multi-Agent & Calm UX -->

- [ ] **Agente de Agenda & Lembretes (AGEND-01..04)**
  - AGEND-01: Detecção de padrões de faltas e no-shows com alertas periféricos (status light)
  - AGEND-02: Lembretes proativos para pacientes via WhatsApp/SMS (batch, nunca em sessão)
  - AGEND-03: Otimização de horários sugerida baseada em histórico de disponibilidade
  - AGEND-04: Batching de notificações em "Resumo do Dia" pós-sessão

- [ ] **Calm UX & Accessibility (CALM-01..05)**
  - CALM-01: Modo foco para escrita clínica (esconde sidebar, top-bar, notificações)
  - CALM-02: Largura máxima do editor de notas em ~70ch para conforto de leitura
  - CALM-03: Light mode como default; dark mode como toggle manual (não automático por OS)
  - CALM-04: Hierarquia de interrupção documentada: status light > badge > dropdown > modal
  - CALM-05: Revisão de contraste em hover states e placeholders para WCAG AA

- [ ] **Arquitetura Multi-Agent (ARCH-01..04)**
  - ARCH-01: Sistema de orquestração de agentes com contextos isolados
  - ARCH-02: Fila de tarefas por agente com priorização de interrupções
  - ARCH-03: Fallback graceful quando offline (local cache, retry queue)
  - ARCH-04: Interface de monitoramento de agentes (status, logs, configuração)

### Out of Scope

- Server-side notifications (Supabase real-time) — v1.4+
- Push/Email notifications — requer infraestrutura adicional
- Nota Fiscal (NFS-e) — alta complexidade de integração
- Integração Bancária (Open Finance) — risco de segurança alto
- Envio automático de recibos por Email/WhatsApp — v1.4+

## Context

- App estável com 453 testes, bundle lean
- Performance resolvida em v1.3-v1.4 — navegação, caching, queries, CWV
- Design system maduro com 50+ CSS tokens, motion tokens, componentes reutilizáveis
- DESIGN.md documenta sistema visual completo do app interno
- Multi-tenant, workspace-scoped, audit trail completo
- Pesquisa UX recente identificou oportunidades em Calm Technology, Cognitive Load, e notificações
- Próximas demandas: agentes inteligentes operando em background, UX calma e evidence-based

## Constraints

- **Stack**: Next.js 15, React 19, Supabase, Prisma, CSS tokens (sem Tailwind)
- **Estilo**: Usar design tokens existentes (referenciar DESIGN.md), zero inline styles em componentes novos
- **Segurança**: MFA/auth deve continuar funcionando corretamente após refatorações
- **Sensibilidade**: importantObservations nunca em listagens — apenas findById e backup export
- **Testes**: 453 testes existentes devem continuar passando
- **Calm UX**: Nenhuma notificação crítica durante sessão em andamento; batching obrigatório
- **Agentes**: Devem operar em background, nunca competir pela atenção central do psicólogo

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design tokens over Tailwind | Controle total, performance, consistência | ✓ Good |
| localStorage para notificações v1 | Velocidade de entrega, sem dependência backend | ✓ Good |
| Top bar layout (Gmail/Notion style) | Padrão UX familiar | ✓ Good |
| Abstração de storage | Facilita migração futura para server-side | ✓ Good |
| force-dynamic no layout (v1.0-v1.2) | Simplicidade inicial, sem pensar em cache | → Removido em v1.3 |
| `<a>` em vez de `<Link>` na nav (v1.0) | Oversight inicial | → Corrigido em v1.3 |
| listByWorkspaceAndDateRange para /financeiro | Range único cobre trend+year+prev, grouping in-memory | ✓ Good |
| findByAppointmentIds retorna Set<string> | Agenda só precisa de presença, não conteúdo da nota | ✓ Good |
| listAllByWorkspace para backup | Backup precisa de dados completos — separado de listagens | ✓ Good |
| JWT AAL fast-path no middleware | Decodifica claim do cookie, skipa API call para aal2 | ✓ Good |
| Light mode como default (v2.0) | Evidência científica mostra performance visual superior em light mode para visão normal | → Implementando v2.0 |
| Agente nunca interrompe sessão (v2.0) | Princípio de Calm Technology: software clínico deve ficar na periferia da atenção | → Implementando v2.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-04-27 after Milestone v2.0 started: Multi-Agent Architecture & Calm UX*
