# Requirements — Módulo Financeiro PsiVault

## Princípios

- **FIN-01:** O financeiro deve ser útil sem ser burocrático — psicólogo não é contador
- **FIN-02:** Registro de pagamento deve ser rápido (máx 2 cliques)
- **FIN-03:** Visão de inadimplência deve ser imediata ao abrir a página
- **FIN-04:** Sem integração com gateway de pagamento — recebe direto do paciente
- **FIN-05:** Sem emissão de nota fiscal — fora do escopo do produto
- **FIN-06:** Cobrança é por sessão, não mensalidade fixa
- **FIN-07:** Valores nunca aparecem em logs ou metadata de busca (SECU-05)

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| FIN-F01 | Status "atrasado" calculado automaticamente baseado na data da sessão | P0 |
| FIN-F02 | Marcar cobrança como pago com 1 clique (quick pay) | P0 |
| FIN-F03 | Filtros por status, paciente e período | P0 |
| FIN-F04 | Cards de inadimplência no topo (valores pendentes, atrasados, recebidos) | P0 |
| FIN-F05 | Resumo agrupado por paciente com totais | P1 |
| FIN-F06 | Exportar CSV com filtros aplicados | P1 |
| FIN-F07 | Preço padrão configurável por paciente | P1 |
| FIN-F08 | Undo de pagamento marcado incorretamente | P1 |
| FIN-F09 | Ordenação da lista por data (mais recente primeiro) | P0 |
| FIN-F10 | Valores formatados em BRL (R$ 150,00) | P0 |

## Critérios de Aceitação

| ID | Critério |
|----|----------|
| FIN-A01 | Psicólogo abre `/financeiro` e em 3s vê quem deve e quanto |
| FIN-A02 | Marcar como pago leva no máximo 2 cliques |
| FIN-A03 | Cobranças atrasadas são destacadas automaticamente sem ação manual |
| FIN-A04 | Filtros funcionam e combinam corretamente (AND) |
| FIN-A05 | Export CSV gera arquivo válido e abrível no Excel |
| FIN-A06 | Preço padrão do paciente é usado ao criar nova sessão |
| FIN-A07 | Nenhum teste existente é quebrado |
| FIN-A08 | TypeScript sem erros (`tsc --noEmit`) |
