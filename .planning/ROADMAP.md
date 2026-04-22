# ROADMAP

## Phases

- [x] **Phase 19: Refatoração UX/UI Finanças** - Refatorar gestão de cobranças com modais e destacar inadimplência (completed 2026-04-22)
- [ ] **Phase 20: Módulo de Gestão de Despesas** - Permitir registro, categorização e anexação de comprovantes de gastos
- [ ] **Phase 21: Emissão de Recibos em PDF** - Gerar, baixar e enviar recibos de cobranças pagas
- [ ] **Phase 22: Relatórios e Fluxo de Caixa** - Dashboard com DRE, gráficos de evolução e exportação de dados

## Phase Details

### Phase 19: Refatoração UX/UI Finanças
**Goal**: Usuários conseguem gerenciar finanças em modais e identificar inadimplência rapidamente, sem recarregar a página
**Depends on**: Nothing
**Requirements**: UXFI-01, UXFI-02
**Success Criteria** (what must be TRUE):
  1. Usuário visualiza e edita formulários de cobrança em modais ou drawers usando `<dialog>`.
  2. Usuário fecha o modal e continua no mesmo contexto da lista financeira.
  3. Usuário visualiza indicativos visuais em destaque para identificar pagamentos atrasados ou inadimplência.
**Plans**: 2 plans
- [x] 19-01-PLAN.md — Refatorar listagem principal em Extrato Bancário e Aba de Inadimplência
- [x] 19-02-PLAN.md — Implementar Drawers de edição via URL, removendo popovers
**UI hint**: yes

### Phase 20: Módulo de Gestão de Despesas
**Goal**: Usuários conseguem registrar, categorizar e documentar os custos operacionais do consultório
**Depends on**: Phase 19
**Requirements**: DESP-01, DESP-02, DESP-03
**Success Criteria** (what must be TRUE):
  1. Usuário pode adicionar uma despesa preenchendo valor, data e descrição.
  2. Usuário pode atribuir uma categoria à despesa lançada.
  3. Usuário pode anexar e visualizar o arquivo de comprovante associado à despesa.
**Plans**: TBD
**UI hint**: yes

### Phase 21: Emissão de Recibos em PDF
**Goal**: Usuários conseguem gerar, baixar e enviar recibos clínicos em PDF contendo dados fiscais
**Depends on**: Phase 19
**Requirements**: RECP-01, RECP-02, RECP-03
**Success Criteria** (what must be TRUE):
  1. Usuário consegue clicar em baixar recibo de uma cobrança paga e recebe um arquivo PDF.
  2. Usuário encontra os dados corretos no recibo: seu CRP/CPF e o CPF do paciente.
  3. Usuário consegue optar por enviar o recibo gerado por Email ou WhatsApp diretamente pelo sistema.
**Plans**: TBD
**UI hint**: yes

### Phase 22: Relatórios e Fluxo de Caixa
**Goal**: Usuários conseguem acompanhar a saúde financeira do consultório e exportar dados consolidados
**Depends on**: Phase 19, Phase 20
**Requirements**: RELA-01, RELA-02, RELA-03
**Success Criteria** (what must be TRUE):
  1. Usuário visualiza uma tela de DRE Simples com o balanço de entradas e saídas.
  2. Usuário gera e baixa um arquivo de exportação de lançamentos para IRPF/Carnê-Leão.
  3. Usuário visualiza gráficos de evolução do seu saldo no dashboard.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 19. Refatoração UX/UI Finanças | 2/2 | Complete   | 2026-04-22 |
| 20. Módulo de Gestão de Despesas | 0/0 | Not started | - |
| 21. Emissão de Recibos em PDF | 0/0 | Not started | - |
| 22. Relatórios e Fluxo de Caixa | 0/0 | Not started | - |