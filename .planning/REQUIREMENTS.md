# Requirements: PsiVault

**Defined:** 2026-04-21
**Core Value:** Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar

## v1 Requirements

### UX Finanças

- [x] **UXFI-01**: Usuário pode gerenciar cobranças usando modais e drawers em vez de formulários inline (usando `<dialog>`)
- [x] **UXFI-02**: Usuário visualiza inadimplência e pagamentos atrasados com destaque na interface

### Despesas

- [ ] **DESP-01**: Usuário pode lançar despesas informando data, valor e descrição
- [ ] **DESP-02**: Usuário pode categorizar despesas
- [ ] **DESP-03**: Usuário pode anexar comprovantes às despesas

### Recibos PDF

- [ ] **RECP-01**: Usuário pode gerar e baixar recibos em PDF para cobranças pagas
- [ ] **RECP-02**: Recibo inclui dados do Psicólogo (CRP, CPF) e Paciente (CPF)
- [ ] **RECP-03**: Sistema pode enviar os recibos automaticamente por Email ou WhatsApp

### Relatórios Consolidados

- [ ] **RELA-01**: Usuário pode visualizar um DRE Simples (Entradas vs Saídas)
- [ ] **RELA-02**: Usuário pode exportar os lançamentos financeiros para IRPF/Carnê-Leão
- [ ] **RELA-03**: Usuário visualiza gráficos de evolução de saldo no dashboard

## v2 Requirements

### UX Avançada

- **UXFI-03**: Sincronizar estado dos modais com a URL para deep linking

## Out of Scope

| Feature | Reason |
|---------|--------|
| Emissão de Nota Fiscal (NFS-e) | Alta complexidade de integração com diferentes prefeituras. Foge do escopo atual. |
| Integração Bancária (Open Finance) | Risco de segurança e compliance muito alto para o MVP. |
| Rateio Complexo / Centro de Custos | Maioria dos usuários são autônomos ou clínicas pequenas. Complexidade desnecessária. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UXFI-01 | Phase 19 | Complete |
| UXFI-02 | Phase 19 | Complete |
| DESP-01 | Phase 20 | Pending |
| DESP-02 | Phase 20 | Pending |
| DESP-03 | Phase 20 | Pending |
| RECP-01 | Phase 21 | Pending |
| RECP-02 | Phase 21 | Pending |
| RECP-03 | Phase 21 | Pending |
| RELA-01 | Phase 22 | Pending |
| RELA-02 | Phase 22 | Pending |
| RELA-03 | Phase 22 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-21*
*Last updated: 2026-04-21 after requirements definition*