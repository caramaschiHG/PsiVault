# PsiLock — Roadmap

## Objetivo

Transformar o módulo financeiro do PsiVault em uma ferramenta **útil, prática e não burocrática** para psicólogos gerenciarem cobranças de sessões com seus pacientes.

## Princípios

1. **Não complicar** — O financeiro deve ajudar, não atrapalhar. Psicólogo não é contador.
2. **Registro rápido** — Marcar pagamento deve levar 2 cliques.
3. **Visão clara** — Saber rapidamente: quem deve, quanto deve, há quanto tempo.
4. **Sem burocracia fiscal** — Sem emissão de NF, sem integração com contador. Apenas controle prático do dia a dia.

## Fases

### Phase 1 — Financeiro Core Melhorado
**Número: 01**  
**Objetivo:** Melhorar o que já existe e adicionar o que realmente importa no dia a dia.

**Entradas:**
- Módulo financeiro atual com `SessionCharge`, `deriveMonthlyFinancialSummary()`
- Página `/financeiro` básica
- Seção financeira no perfil do paciente

**Saídas esperadas:**
- [ ] Dashboard financeiro claro e direto (resumo do mês, inadimplentes, trends)
- [ ] Marcar pagamento como "pago" com 1 clique direto na lista
- [ ] Filtros úteis: por status (pendente/pago/atrasado), por paciente, por período
- [ ] Indicador visual de inadimplência (dias em atraso)
- [ ] Resumo por paciente (total devido, total pago no mês/ano)
- [ ] Exportar relatório simples (CSV/PDF) — "quem pagou e quem deve este mês"
- [ ] Atualizar status "atrasado" automaticamente baseado na data da sessão
- [ ] Configurar preço padrão da sessão por paciente

**Critérios de aceitação:**
- Psicólogo consegue ver quem deve em < 5 segundos
- Psicólogo consegue marcar pagamento em < 3 segundos
- Relatório exportado é legível e útil

**Dependências:** Nenhuma

### Phase 2 — Conveniências e Automações
**Número: 02**  
**Objetivo:** Reduzir trabalho manual com automações inteligentes.

**Entradas:**
- Phase 1 completa

**Saídas esperadas:**
- [ ] Geração automática de cobrança ao criar sessão
- [ ] Alerta visual de paciente com múltiplas sessões pendentes
- [ ] Lembrete de cobrança pendente (in-app, não email)
- [ ] Pacote de sessões (ex: comprou 4, usa ao longo do mês)
- [ ] Desconto por sessão configurável (ex: preço social)
- [ ] Histórico anual simplificado (total recebido vs pendente por mês)

**Critérios de aceitação:**
- Ao criar sessão, cobrança aparece automaticamente
- Psicólogo vê alerta de inadimplência sem buscar
- Pacote de sessões deduz corretamente

**Dependências:** Phase 1

### Phase 3 — Relatórios e Insights
**Número: 03**  
**Objetivo:** Dar visão estratégica sem complicar.

**Entradas:**
- Phase 2 completa

**Saídas esperadas:**
- [ ] Gráfico simples: receita mensal dos últimos 6-12 meses
- [ ] Comparativo mês atual vs mês anterior (% variação)
- [ ] Top pacientes por valor (quem mais paga)
- [ ] Previsão de receita (baseado em sessões agendadas)
- [ ] Resumo anual para declaração de IR do psicólogo (total recebido no ano)

**Critérios de aceitação:**
- Gráficos são claros e legíveis
- Resumo anual é exportável
- Previsão de receita é razoavelmente precisa

**Dependências:** Phase 2

## O que NÃO faremos (para não complicar)

- ❌ Integração com gateway de pagamento (Stripe, etc.) — psicólogo recebe direto
- ❌ Emissão de nota fiscal — fora do escopo do produto
- ❌ Controle de despesas do consultório — não é o foco
- ❌ Sistema de assinatura/mensalidade — cobrança é por sessão
- ❌ Integração com contador — psicólogo exporta CSV se precisar
- ❌ Múltiplas moedas — Brasil, BRL apenas
- ❌ Split de pagamento — não se aplica

## Estado Atual

- [x] Modelo `SessionCharge` existe no Prisma
- [x] Repository pattern implementado
- [x] Página `/financeiro` básica funcional
- [x] Seção financeira no perfil do paciente
- [ ] Status "atrasado" não é atualizado automaticamente
- [ ] UX de pagamento requer formulário (deveria ser 1 clique)
- [ ] Sem filtros úteis
- [ ] Sem exportação
- [ ] Sem visão de inadimplência
