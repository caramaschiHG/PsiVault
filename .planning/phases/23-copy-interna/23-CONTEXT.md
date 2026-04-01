# Phase 23: Copy Interna - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Alinhar navegação, dashboard e onboarding com vocabulário e tom de marca psicanalítico. O psicólogo que entra no app sente a mesma coerência que viu na landing. Não inclui novas funcionalidades clínicas — apenas copy, labels e estrutura de navegação.

</domain>

<decisions>
## Implementation Decisions

### Sidebar — estrutura de navegação
- Adicionar item "Prontuário" à sidebar como entrada de topo
- Criar rota `/prontuario` como lista independente — visão clínica orientada ao registro (pacientes com evoluções recentes), não só cadastro
- Documentos **não** ganha entrada na sidebar nesta fase — acesso permanece via perfil do paciente
- Estrutura final da sidebar: Início, Agenda, Pacientes, Prontuário, Financeiro, Configurações

### Dashboard — título e seções
- H1 "Início" mantido — neutro, funciona, não viola vocabulário proibido
- Seções "Hoje", "Lembretes ativos", "Resumo do mês" mantidas
- Framing clínico aplicado via empty states e labels, não via renomeação das seções
- Empty state da seção "Hoje": substituir "Nenhuma sessão agendada para hoje." por linguagem de atendimento — ex: "Sem atendimentos hoje." ou "Sua agenda está livre hoje."

### Dashboard — labels de métricas (Resumo do mês)
- "Sessões realizadas" → "Atendimentos realizados" (Phase 21 define 'atendimento' como vocabulário obrigatório)
- "Pacientes ativos" → mantido (vocabulário já correto)
- "cobranças em aberto" → "A receber" ou "Recibos pendentes" — linguagem de consultório, sem jargão financeiro de software

### Onboarding (complete-profile)
- H1: "Complete seu cadastro." → **"Configure seu consultório."** — framing de preparo do espaço de trabalho, não preenchimento de formulário
- Eyebrow "Perfil profissional" → mantido — preciso e neutro
- Subcopy mantido: "Esses dados identificam você nos documentos clínicos e configuram sua agenda." — já é concreto e funcional

### Claude's Discretion
- Copy exato do empty state da seção "Hoje" (desde que use "atendimento", não "sessão")
- Copy exato do label de métricas financeiras ("A receber" ou "Recibos pendentes")
- Estrutura visual e conteúdo da rota `/prontuario` (lista de pacientes com evoluções recentes — layout e densidade à critério do executor)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `vault-sidebar-nav.tsx`: array `NAV_ITEMS` — adicionar objeto `{href: "/prontuario", label: "Prontuário", icon: ...}` seguindo padrão existente
- `inicio/page.tsx`: labels inline no JSX — editar `snapshotLabelStyle` entries e empty state text diretamente
- `complete-profile/page.tsx`: h1 "Complete seu cadastro." substituído diretamente no JSX
- Padrão de ícones SVG inline já estabelecido na sidebar — novo ícone de prontuário segue o mesmo padrão (stroke, viewBox 24×24)

### Established Patterns
- Labels e copy inline no JSX (não CMS, não arquivo separado) — editar diretamente nos .tsx
- `satisfies React.CSSProperties` para estilos — manter
- Nenhum label em inglês nos itens de nav — padrão já estabelecido

### Integration Points
- `/prontuario` é nova rota dentro de `(vault)/` — precisa de `page.tsx`, possivelmente `loading.tsx`
- `isActive("/prontuario")` no `VaultSidebarNav` deve usar `pathname.startsWith("/prontuario")`
- A rota `/prontuario` lista pacientes com prontuários — integra com `PatientRepository` e `ClinicalRepository`

</code_context>

<specifics>
## Specific Ideas

- "Configure seu consultório." posiciona o onboarding como preparo de um espaço de trabalho — coerente com a sensação de produto discreto e profissional que a landing estabeleceu
- "Prontuário" como entrada direta na sidebar é o sinal mais forte de que o produto entende a prática psicanalítica — o registro clínico é central, não secundário ao cadastro de pacientes
- A rota `/prontuario` deve transmitir continuidade: lista de pacientes ordenada por atividade recente, com indicação de última evolução — antecipa a Phase 24

</specifics>

<deferred>
## Deferred Ideas

- Documentos como entrada de sidebar — decidido para fase posterior se necessário
- Mensagem de boas-vindas pós-onboarding no dashboard — não priorizou nesta discussão
- Redesign visual da rota `/prontuario` com hierarquia temporal — Phase 24 (Continuidade e Fluxo)

</deferred>

---

*Phase: 23-copy-interna*
*Context gathered: 2026-04-01*
