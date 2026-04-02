# Phase 24: Continuidade e Fluxo - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fazer a experiência do prontuário comunicar acompanhamento ao longo do tempo. O psicólogo navega pelo histórico de um paciente e sente a continuidade do trabalho analítico, não uma lista de registros isolados. Entrega: nova rota `/prontuario/[patientId]` como view clínica focada, e ajustes na `/prontuario` (lista). Não inclui novas funcionalidades clínicas — foco em estrutura, hierarquia e linguagem.

</domain>

<decisions>
## Implementation Decisions

### Destino do fluxo clínico
- Criar nova rota `/prontuario/[patientId]` — view clínica pura, separada de `/patients/[id]`
- A nova view contém: identidade do paciente + próxima sessão (como primeira entrada da timeline) + timeline cronológica + documentos clínicos
- `/patients/[patientId]` permanece intocada — continua sendo a página operacional (finanças, lembretes, edição de cadastro)
- Conexão entre as duas: link discreto na view clínica chamado "Dados cadastrais" apontando para `/patients/[id]`
- Link "Ver prontuário" nos cards da `/prontuario` mantém esse texto e aponta para a nova rota

### Navegação cronológica (timeline)
- Agrupamento por status removido — lista cronológica pura, mais recente primeiro
- Próxima sessão integrada como primeira entrada da timeline (marcada visualmente como "Próxima")
- Canceladas/no-show: recolhidas por padrão — contagem discreta no final ("3 sessões dispensadas") com opção de expandir
- Cada entrada exibe: data + número da sessão, modo de atendimento (Presencial/Online), link para documento gerado (se existir)
- O indicador de "registro clínico escrito" não aparece por padrão — Claude decide se inclui como detalhe visual
- 5 sessões visíveis, restante recolhido com "Ver mais" (mantém padrão atual)

### Hierarquia visual e orientação (CONT-03)
- Breadcrumb no topo: "Prontuário → [Nome do paciente]" — link "Prontuário" volta para `/prontuario`
- H1: nome do paciente — em serif (`var(--font-serif)`), proeminência editorial (Phase 21 já definiu serif para conteúdo clínico)
- Separação de seções via h2 + separadores horizontais — hierarquia tipográfica explícita
- Seções não usam cards individuais — page flow linear com divisores

### Empty states e linguagem (CONT-04)
- Timeline sem sessões: mensagem de início + CTA discreto para agendar ("Agendar primeira sessão" ou "Começar acompanhamento")
- Seção de documentos sem documentos: texto discreto "Nenhum documento gerado neste acompanhamento." — seção sempre visível
- Card na `/prontuario` sem notas clínicas: badge ou tag discreta "Novo acompanhamento" — diferencia visualmente
- Copy exato dos empty states: Claude decide dentro do vocabulário psicanalítico obrigatório (atendimento, prontuário, acompanhamento — sem "sessão", "cliente", "serviço")

### Claude's Discretion
- Indicador visual de registro escrito por sessão (pode incluir como detalhe se fizer sentido)
- Densidade visual dos cards da timeline
- Loading skeleton do `/prontuario/[patientId]`
- Copy exato dos empty states (dentro do vocabulário obrigatório)
- Estilo exato do breadcrumb e separadores

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ClinicalTimeline` (`src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx`): componente existente com agrupamento por status — a nova view reusa a lógica de dados mas reconstrói a apresentação (cronológico, sem agrupamento)
- `EmptyState` (`src/app/(vault)/components/empty-state.tsx`): componente reutilizável para estados vazios
- `prontuario/page.tsx`: lista existente com lógica de ordenação por atividade recente — reutilizar como ponto de entrada
- `resolveSession()`: autenticação e workspaceId disponíveis via import padrão

### Established Patterns
- Server Components puros (sem `use client`) para páginas de dados — padrão dominante no vault
- `satisfies React.CSSProperties` para estilos inline
- Repositórios via `getPatientRepository()`, `getClinicalNoteRepository()`, `getAppointmentRepository()`, `getDocumentRepository()`
- `Promise.all()` para carregar dados de múltiplos repositórios em paralelo
- `Intl.DateTimeFormat` com `pt-BR` para formatação de datas

### Integration Points
- Nova rota: `src/app/(vault)/prontuario/[patientId]/page.tsx` + `loading.tsx`
- Dados necessários: `patientRepo.findById()`, `appointmentRepo.listByPatient()`, `clinicalRepo.listByPatient()`, `documentRepo.listByPatient()`
- Breadcrumb navega para `/prontuario` (já existe)
- Link "Dados cadastrais" navega para `/patients/[patientId]` (já existe)
- Badge "Novo acompanhamento" na `/prontuario/page.tsx`: adicionar condição no card quando `latestNote === null`

</code_context>

<specifics>
## Specific Ideas

- A view `/prontuario/[patientId]` deve transmitir "retomada de acompanhamento" — o psicólogo chega aqui para relembrar onde o trabalho estava, não para preencher formulários
- Cronológico puro (mais recente primeiro) é a decisão mais importante: o psicólogo quer ver "o que aconteceu por último" antes de "o que aconteceu no começo"
- A próxima sessão como primeira entrada da timeline posiciona o futuro como extensão natural do histórico — o acompanhamento ainda está acontecendo

</specifics>

<deferred>
## Deferred Ideas

- Nenhuma ideia de escopo fora desta fase surgiu durante a discussão — discussão ficou centrada nos requisitos CONT-01 a CONT-04

</deferred>

---

*Phase: 24-continuidade-e-fluxo*
*Context gathered: 2026-04-02*
