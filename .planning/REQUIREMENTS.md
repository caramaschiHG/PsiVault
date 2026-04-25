# Requirements: PsiVault v1.6 Documentos — Workflow Clínico Impecável

**Defined:** 2026-04-25
**Core Value:** Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.

## v1.6 Requirements

### Foundation & Migration (MIGR)

- [ ] **MIGR-01**: Schema `PracticeDocument` possui colunas novas: `status` (default "finalized"), `appointmentId` (nullable), `signedAt` (nullable), `signedByAccountId` (nullable), `deliveredAt` (nullable), `deliveredTo` (nullable), `deliveredVia` (nullable) — todas nullable para zero downtime
- [ ] **MIGR-02**: Migration Prisma mapeia documentos existentes: `archivedAt != null` → `status='archived'`; demais → `status='finalized'`. Nenhum documento existente é perdido ou inacessível
- [ ] **MIGR-03**: Índices compostos novos criados: `[workspaceId, patientId, status]`, `[workspaceId, patientId, createdAt]`, `[appointmentId]`
- [ ] **MIGR-04**: Domain model inclui `DocumentStatus` como tipo canônico (`draft` | `finalized` | `signed` | `delivered` | `archived`), funções puras de transição com guards, e IDs com prefixo `doc_`
- [ ] **MIGR-05**: Repository extended com `listByStatus`, `listDraftsByPatient`, `findByAppointmentId`, `listActiveByPatientWithStatus` — todos com workspace scoping

### Estados e Rascunho (STAT)

- [ ] **STAT-01**: Documento pode ser criado como `draft` via `createDocumentAction` — sempre salva no servidor, nunca em localStorage
- [ ] **STAT-02**: Auto-save server-side de rascunho a cada 3s (debounce) via `saveDraftAction` — upsert de rascunho existente
- [ ] **STAT-03**: Transições de estado são Server Actions: `finalizeDocumentAction`, `signDocumentAction`, `deliverDocumentAction`, `archiveDocumentAction` — cada uma valida workspace, role, e guards de transição
- [ ] **STAT-04**: Listagem de documentos é cronológica (mais recente primeiro) com badges de estado: Rascunho, Pendente, Assinado, Entregue, Arquivado
- [ ] **STAT-05**: Filtros rápidos na listagem: "Todos", "Rascunhos", "Pendentes", "Assinados", "Entregues", "Arquivados"
- [ ] **STAT-06**: Documento `signed` torna conteúdo imutável (não editável). Documento `delivered` registra `deliveredAt`, `deliveredTo`, `deliveredVia` com audit trail

### Editor Unificado e Preview (EDIT)

- [ ] **EDIT-01**: `DocumentEditor` unificado com modo `free` (rich text completo, sem template — para `session_record`) e modo `structured` (seções pré-definidas pelo template — para documentos formais)
- [ ] **EDIT-02**: Visualização de documento (`/documents/[id]`) renderiza em layout A4 simulado na tela: margens, tipografia adequada, cabeçalho com dados do profissional e paciente
- [ ] **EDIT-03**: Todo documento `finalized` ou `signed` pode gerar PDF. Preview PDF embutido em modal sem precisar fazer download
- [ ] **EDIT-04**: Assinatura digital é verificada apenas no momento de `sign` — documentos podem ser criados e editados sem assinatura configurada
- [ ] **EDIT-05**: `@react-pdf/renderer` suporta rich text: HTML do editor é convertido para nodes do react-pdf (ou via `react-pdf-html` se compatível)
- [ ] **EDIT-06**: Templates visuais por tipo com substituição segura de variáveis (`{{patientName}}`, `{{date}}`, etc.) — sanitização antes de renderização

### Integração com Atendimentos (APPT)

- [ ] **APPT-01**: Documento pode ter `appointmentId` opcional. Quando presente, visualização mostra contexto do atendimento (data, hora, tipo)
- [ ] **APPT-02**: Criação de documento a partir da página de atendimento preenche `appointmentId` e dados da sessão automaticamente
- [ ] **APPT-03**: Declaração de comparecimento (`attendance_certificate`) só pode ser criada vinculada a um atendimento específico
- [ ] **APPT-04**: Pre-fill de relatórios usa apenas notas clínicas do período relevante (últimas N sessões até o atendimento vinculado), não todo histórico do paciente
- [ ] **APPT-05**: Fluxo sessão→documento preserva parâmetro `from` para navegação de volta intuitiva

### Dashboard e Navegação (DASH)

- [ ] **DASH-01**: Psicólogo pode acessar dashboard global `/documentos` com todos os documentos do workspace, ordenados cronologicamente
- [ ] **DASH-02**: Dashboard exibe filtros por tipo de documento, intervalo de datas, paciente e estado
- [ ] **DASH-03**: Documentos no dashboard são agrupados visualmente por tipo com contagem
- [ ] **DASH-04**: Breadcrumbs hierárquicos presentes em todos os fluxos de documentos (Pacientes > Fulano > Documentos > Novo > Laudo)
- [ ] **DASH-05**: Tabs no perfil do paciente preservam estado na URL (query params) para deep-linking e refresh seguro
- [ ] **DASH-06**: Dashboard não inclui campos sensíveis (`importantObservations`) em nenhuma listagem

### Polish e Cleanup (CLEAN)

- [ ] **CLEAN-01**: Código legado removido: auto-save localStorage de documentos, textarea para documentos formais, visualização em `<pre>`, duplicação de `VALID_TYPES`
- [ ] **CLEAN-02**: Todos os 419+ testes existentes passam; novos testes cobrem transições de estado, migração de dados, e geração de PDF
- [ ] **CLEAN-03**: Documentos existentes de usuários reais permanecem intactos — validação via teste de migração em ambiente de staging
- [ ] **CLEAN-04**: Audit trail cobre `document.finalized`, `document.signed`, `document.delivered`, `document.draft_saved` com metadados apropriados

## v2 Requirements (Deferred)

### Keyboard Shortcuts (SHORT)

- **SHORT-01**: Atalhos com modificador (`Ctrl+Shift+N/D/E`) para ações de fluxo frequentes
- **SHORT-02**: Modal de ajuda de atalhos acionado por `?`
- **SHORT-03**: Atalhos respeitam foco em inputs e preferência de reduced motion

### Enhanced Note Flow

- **FLOW-05**: Drawer inline para criação de nota sem sair da página atual (alternativa ao redirect)
- **FLOW-06**: Sugestão automática de conteúdo baseada em notas anteriores (sem AI — apenas estrutura)

### Dashboard Advanced

- **DASH-07**: Full-text search em metadados de documentos (não conteúdo clínico)
- **DASH-08**: Exportação em lote de documentos filtrados

## Out of Scope

| Feature | Reason |
|---------|--------|
| Inline note drawer (v1.6) | Redirect cobre 95% do valor com 5% do esforço; drawer é enhancement v2 |
| Smart suggestions com AI | Anti-padrão de posicionamento PsiVault (não substituir julgamento clínico) |
| Full-text search em conteúdo de documentos | Risco de segurança — conteúdo clínico não deve ser indexado para busca global |
| Custom template builder drag-drop | Complexidade excessiva para usuário-alvo; templates hardcoded cobrem 95% dos casos |
| Single-key shortcuts (`N`, `D`) | Viola WCAG 2.1 SC 2.1.1 — conflito com screen readers e navegação por teclado |
| Client-side PDF generation pesado (html2canvas/jspdf) | Bundle bloat 500KB+, congela UI, problemas com acentuação pt-BR; usar react-pdf existente |
| Real-time collaborative editing | Complexidade alta, não necessário para prática solo de psicólogos |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MIGR-01 | Phase 37 | Pending |
| MIGR-02 | Phase 37 | Pending |
| MIGR-03 | Phase 37 | Pending |
| MIGR-04 | Phase 37 | Pending |
| MIGR-05 | Phase 37 | Pending |
| STAT-01 | Phase 38 | Pending |
| STAT-02 | Phase 38 | Pending |
| STAT-03 | Phase 38 | Pending |
| STAT-04 | Phase 38 | Pending |
| STAT-05 | Phase 38 | Pending |
| STAT-06 | Phase 38 | Pending |
| EDIT-01 | Phase 39 | Pending |
| EDIT-02 | Phase 39 | Pending |
| EDIT-03 | Phase 39 | Pending |
| EDIT-04 | Phase 39 | Pending |
| EDIT-05 | Phase 39 | Pending |
| EDIT-06 | Phase 39 | Pending |
| APPT-01 | Phase 40 | Pending |
| APPT-02 | Phase 40 | Pending |
| APPT-03 | Phase 40 | Pending |
| APPT-04 | Phase 40 | Pending |
| APPT-05 | Phase 40 | Pending |
| DASH-01 | Phase 41 | Pending |
| DASH-02 | Phase 41 | Pending |
| DASH-03 | Phase 41 | Pending |
| DASH-04 | Phase 41 | Pending |
| DASH-05 | Phase 41 | Pending |
| DASH-06 | Phase 41 | Pending |
| CLEAN-01 | Phase 42 | Pending |
| CLEAN-02 | Phase 42 | Pending |
| CLEAN-03 | Phase 42 | Pending |
| CLEAN-04 | Phase 42 | Pending |

**Coverage:**
- v1.6 requirements: 32 total
- Mapped to phases: 32 ✓
- Unmapped: 0

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 after research and scoping*
