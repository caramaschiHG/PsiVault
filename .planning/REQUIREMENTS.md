# Requirements: PsiVault v1.6 Documentos — Workflow Clínico Impecável

**Defined:** 2026-04-25
**Core Value:** Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.

## v1.6 Requirements

### Dashboard & Navegação (DASH)

- [ ] **DASH-01**: Psicólogo pode acessar dashboard global `/documentos` com todos os documentos do workspace
- [ ] **DASH-02**: Dashboard exibe filtros por tipo de documento, intervalo de datas e paciente
- [ ] **DASH-03**: Documentos no dashboard são agrupados visualmente por tipo com contagem
- [ ] **DASH-04**: Breadcrumbs hierárquicos presentes em todos os fluxos de documentos (Pacientes > Fulano > Documentos > Novo > Laudo)
- [ ] **DASH-05**: Tabs no perfil do paciente preservam estado na URL (query params) para deep-linking e refresh seguro
- [ ] **DASH-06**: Dashboard não inclui campos sensíveis (`importantObservations`) em nenhuma listagem

### Timeline Clínica (TIME)

- [ ] **TIME-01**: Timeline clínica exibe visual de linha do tempo com conector CSS vertical
- [ ] **TIME-02**: Cards de atendimento simplificados: data, status e badge de presença de nota apenas
- [ ] **TIME-03**: Comunicação e detalhes adicionais ficam em drawer colapsável sob demanda
- [ ] **TIME-04**: Atendimentos agrupados por mês ou trimestre com header de período
- [ ] **TIME-05**: Timeline usa cursor pagination para carregar histórico progressivamente (não tudo de uma vez)
- [ ] **TIME-06**: Nenhuma query de timeline inclui conteúdo de `importantObservations`

### Editor de Notas (NOTE)

- [ ] **NOTE-01**: Psicólogo pode selecionar template clínico visual (SOAP, BIRP, Livre) que injeta estrutura no editor
- [ ] **NOTE-02**: Editor de notas possui modo foco que colapsa sidebar e oculta campos opcionais
- [ ] **NOTE-03**: Indicador de auto-save visível com timestamp ("Salvo localmente às 14:32" / "Salvo no servidor")
- [ ] **NOTE-04**: Rascunhos de notas em localStorage são criptografados via Web Crypto API antes de persistir
- [ ] **NOTE-05**: Templates clínicos respeitam o vocabulário do PsiVault (não usam jargão de wellness/coach)

### Editor de Documentos (DOCM)

- [ ] **DOCM-01**: Psicólogo pode visualizar preview do PDF antes de salvar o documento (modal com react-pdf)
- [ ] **DOCM-02**: Composer de documentos oferece templates visuais por tipo (declaração, laudo, recibo, registro privado)
- [ ] **DOCM-03**: Preview de PDF usa lazy-loading para não impactar bundle de rotas que não precisam de PDF
- [ ] **DOCM-04**: Templates de documentos usam variáveis de paciente (nome, data) com substituição segura

### Fluxo Integrado (FLOW)

- [ ] **FLOW-01**: Ao marcar atendimento como COMPLETED na agenda, psicólogo vê quick action "Criar nota" que redireciona para editor com contexto preservado
- [ ] **FLOW-02**: Botão de quick action para novo documento acessível diretamente no perfil do paciente
- [ ] **FLOW-03**: Redirecionamento de fluxo preserva parâmetro `from` para navegação de volta intuitiva
- [ ] **FLOW-04**: Quick actions não bypassam repository pattern — usam Server Actions validadas com workspace + role

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
| DASH-01 | Phase TBD | Pending |
| DASH-02 | Phase TBD | Pending |
| DASH-03 | Phase TBD | Pending |
| DASH-04 | Phase TBD | Pending |
| DASH-05 | Phase TBD | Pending |
| DASH-06 | Phase TBD | Pending |
| TIME-01 | Phase TBD | Pending |
| TIME-02 | Phase TBD | Pending |
| TIME-03 | Phase TBD | Pending |
| TIME-04 | Phase TBD | Pending |
| TIME-05 | Phase TBD | Pending |
| TIME-06 | Phase TBD | Pending |
| NOTE-01 | Phase TBD | Pending |
| NOTE-02 | Phase TBD | Pending |
| NOTE-03 | Phase TBD | Pending |
| NOTE-04 | Phase TBD | Pending |
| NOTE-05 | Phase TBD | Pending |
| DOCM-01 | Phase TBD | Pending |
| DOCM-02 | Phase TBD | Pending |
| DOCM-03 | Phase TBD | Pending |
| DOCM-04 | Phase TBD | Pending |
| FLOW-01 | Phase TBD | Pending |
| FLOW-02 | Phase TBD | Pending |
| FLOW-03 | Phase TBD | Pending |
| FLOW-04 | Phase TBD | Pending |

**Coverage:**
- v1.6 requirements: 25 total
- Mapped to phases: 0 (awaiting roadmap)
- Unmapped: 25

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 after research and scoping*
