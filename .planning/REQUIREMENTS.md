# Requirements: PsiVault v1.3 Performance

**Defined:** 2026-04-22
**Core Value:** Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar

## v1.3 Requirements

### Navegação

- [ ] **NAV-01**: Usuário navega entre seções do app sem recarregar a página completa (sidebar e bottom nav usam Next.js `<Link>` em vez de `<a href>`)

### Cache e Renderização

- [ ] **CACHE-01**: App aproveita o mecanismo de caching do Next.js — `force-dynamic` removido do vault layout; páginas usam caching por default e declaram `dynamic` apenas quando necessário
- [ ] **CACHE-02**: `resolveSession()` é executada no máximo uma vez por request — `React.cache()` deduplica as chamadas a Supabase e DB quando a função é invocada por múltiplos server components

### Auth e Middleware

- [ ] **AUTH-01**: Middleware não duplica a chamada `supabase.auth.getUser()` já feita durante `updateSession()` — user é reutilizado ou passado via header para eliminar o 2º RTT Supabase por request
- [ ] **AUTH-02**: Verificação de nível MFA (`getAuthenticatorAssuranceLevel`) no middleware não executa em todo request vault — status AAL é cacheado por request ou verificação é pulada quando já confirmado

### Finance Queries

- [ ] **QUERY-01**: Página `/financeiro` carrega com ≤10 queries de DB — dados de trend (6 meses) e DRE anual (12 meses) são consolidados em agregações SQL (`GROUP BY`) em vez de 18× `loadMonthBreakdown` individuais
- [ ] **QUERY-02**: Charts de evolução financeira (trend 6 meses e DRE anual) são carregados client-side após o render inicial da página — não bloqueiam o SSR da listagem principal
- [ ] **QUERY-03**: Server actions de `/financeiro` (marcar como pago, criar cobrança, etc.) não disparam re-render completo da página — `revalidatePath` com escopo narrowado ou updates otimistas no cliente

### Queries e Limpeza

- [ ] **QUERY-04**: Página de agenda busca clinical notes para todos os atendimentos completados em uma única query batch — não N queries individuais para N atendimentos
- [ ] **QUERY-05**: `listActive()` e `listArchived()` do patient repository não retornam `importantObservations` — campo excluído via `select` quando não necessário

## v2 Requirements (Deferred)

### Finanças Avançadas

- **RECP-01**: Usuário pode gerar e baixar recibos em PDF para cobranças pagas ← adiado para v1.4
- **RECP-02**: Recibo inclui dados do Psicólogo (CRP, CPF) e Paciente (CPF) ← adiado para v1.4
- **RECP-03**: Sistema pode enviar os recibos automaticamente por Email ou WhatsApp ← adiado para v1.4
- **RELA-01**: Usuário pode visualizar um DRE Simples (Entradas vs Saídas) ← adiado para v1.4
- **RELA-02**: Usuário pode exportar os lançamentos financeiros para IRPF/Carnê-Leão ← adiado para v1.4
- **RELA-03**: Usuário visualiza gráficos de evolução de saldo no dashboard ← adiado para v1.4

### UX Avançada

- **UXFI-03**: Sincronizar estado dos modais com a URL para deep linking ← backlog

## Out of Scope

| Feature | Reason |
|---------|--------|
| Emissão de Nota Fiscal (NFS-e) | Alta complexidade de integração com diferentes prefeituras |
| Integração Bancária (Open Finance) | Risco de segurança e compliance muito alto |
| Rateio Complexo / Centro de Custos | Complexidade desnecessária para maioria dos usuários autônomos |
| Server-side notifications (Supabase real-time) | Adiado para v1.4+ |
| Push/Email notifications | Requer infraestrutura adicional |
| Otimização de bundle JS (code splitting agressivo) | Bundle atual já é lean (102 kB shared), não prioridade |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 23 | Pending |
| CACHE-01 | Phase 23 | Pending |
| CACHE-02 | Phase 23 | Pending |
| AUTH-01 | Phase 24 | Pending |
| AUTH-02 | Phase 24 | Pending |
| QUERY-01 | Phase 25 | Pending |
| QUERY-02 | Phase 25 | Pending |
| QUERY-03 | Phase 25 | Pending |
| QUERY-04 | Phase 26 | Pending |
| QUERY-05 | Phase 26 | Pending |

**Coverage:**
- v1.3 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-22*
*Last updated: 2026-04-22*
