# Context — Phase 01: Financeiro Core Melhorado

## Visão Geral

Transformar o módulo financeiro existente em algo realmente útil para o psicólogo no dia a dia. O foco é **clareza, rapidez e zero burocracia**.

## Estado Atual do Código

### O que funciona
- Modelo `SessionCharge` no Prisma com campos: status, amountInCents, paymentMethod, paidAt
- Repository pattern em `src/lib/finance/` com implementação Prisma
- Página `/financeiro` com resumo mensal e trend chart
- `deriveMonthlyFinancialSummary()` para agregação mensal
- Seção financeira no perfil do paciente
- Audit events para lifecycle de cobranças

### O que precisa melhorar
1. **Status "atrasado" é manual** — deveria ser automático baseado na data
2. **Marcar pago requer formulário** — deveria ser 1 clique
3. **Sem filtros** — lista mostra tudo misturado
4. **Sem indicadores visuais claros** — não bate o olho e vê o problema
5. **Sem exportação** — não dá pra levar os dados pra lugar nenhum
6. **Preço único para todos** — não permite preço diferenciado por paciente

## Decisões de Design

### O que NÃO vamos fazer
- ❌ Integrar Stripe/PagSeguro — psicólogo recebe direto do paciente
- ❌ Emitir nota fiscal — fora do escopo
- ❌ Controle de despesas — não é o foco
- ❌ Múltiplas moedas — apenas BRL
- ❌ Split de pagamento — não se aplica

### O que vamos fazer
- ✅ Tornar o óbvio automático (atrasado = data passou sem pagamento)
- ✅ Reduzir cliques ao mínimo
- ✅ Dar visão clara de quem deve
- ✅ Permitir exportar quando precisar

## Stack Relevante
- Next.js 15 App Router (Server Components)
- Prisma 6 + PostgreSQL (Supabase)
- Server Actions para mutations
- CSS puro para UI (sem libs de componente)

## Restrições de Segurança
- **SECU-05:** `amountInCents` e `paymentMethod` NUNCA aparecem em logs, busca ou metadata de auditoria
- Valores só são visíveis na página financeira e perfil do paciente (ambos protegidos por auth)
