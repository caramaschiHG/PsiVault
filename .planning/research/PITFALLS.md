# Pitfalls Research

**Domain:** Health/Finance Platform (PsiVault)
**Researched:** 2026-04-21
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Modals Breaking Browser History and Deep Linking

**What goes wrong:**
Ao refatorar a UX de finanças para usar modais e drawers em vez de páginas inline, o estado do modal é gerenciado apenas localmente (`useState`). O usuário clica em "Voltar" no navegador querendo fechar o modal, mas acaba saindo da plataforma. Além disso, não é possível enviar o link de uma despesa específica para conferência.

**Why it happens:**
É mais rápido e simples implementar modais usando estado local do React, ignorando a integração com o roteador do Next.js.

**How to avoid:**
Sincronizar o estado dos modais com a URL utilizando Search Params (ex: `?despesa=exp_123`) ou utilizar Next.js Intercepting/Parallel Routes.

**Warning signs:**
Ao recarregar a página (F5) com um modal aberto, o modal desaparece. O botão "Voltar" do mouse não fecha o drawer.

**Phase to address:**
Phase: Refatoração UX/UI Finanças

---

### Pitfall 2: Geração de PDF no Serverless Causando Timeouts (Vercel)

**What goes wrong:**
A emissão de recibos falha em produção com "504 Gateway Timeout" ou excede o limite de tamanho do bundle da Vercel.

**Why it happens:**
Desenvolvedores frequentemente escolhem bibliotecas pesadas de Node.js (como Puppeteer) para gerar PDFs a partir de HTML, o que é inviável em ambientes serverless com limites estritos (10s a 50s de execução, 50MB de bundle).

**How to avoid:**
Utilizar bibliotecas leves nativas para PDF (como `pdf-lib` ou `@react-pdf/renderer`) que funcionam bem no Edge/Serverless, ou gerar no cliente (Web Worker) se os dados não precisarem de processamento seguro no backend. A preferência é streaming direto via Server Action.

**Warning signs:**
O tempo de build aumenta drasticamente; a geração no ambiente local (Node puro) é rápida, mas em preview/produção é lenta ou falha.

**Phase to address:**
Phase: Emissão de Recibos PDF

---

### Pitfall 3: Vazamento de Dados Multi-tenant em Relatórios (DRE)

**What goes wrong:**
O psicólogo A consegue ver os valores consolidados ou o fluxo de caixa incluindo transações do psicólogo B.

**Why it happens:**
Ao escrever queries complexas de agregação (Prisma `groupBy` ou `Raw SQL`) para os relatórios consolidados, o desenvolvedor esquece de aplicar o filtro mandatório `where: { workspaceId }`.

**How to avoid:**
Isolar a lógica no Repository Pattern (`src/lib/finance/repository.prisma.ts`). Toda função que busca transações ou faz cálculos deve exigir o `workspaceId` como primeiro parâmetro e injetá-lo na query base antes de qualquer agregação.

**Warning signs:**
Os valores totais de receita parecem inflados; testes automatizados falham quando executados com múltiplos tenants no mesmo banco in-memory.

**Phase to address:**
Phase: Relatórios Consolidados

---

### Pitfall 4: Estrutura de Banco Rígida Quebrando Dados Históricos

**What goes wrong:**
Ao introduzir o Módulo de Despesas, antigos recebimentos ou transações financeiras param de ser exibidos corretamente ou geram erros na UI por falta de campos obrigatórios recém-adicionados (ex: `categoryId`).

**Why it happens:**
A migração do Prisma adiciona novos campos como não-nulos sem prever um valor padrão seguro, ou a lógica de UI pressupõe que toda transação financeira agora possui uma categoria.

**How to avoid:**
Adicionar novos campos (`categoryId`, `receiptUrl`) como opcionais (`?`) ou com `default()` bem definido. Criar scripts de migração de dados que classifiquem transações antigas como "Sem Categoria".

**Warning signs:**
Erros de type mismatch no TypeScript; a tela de finanças quebra (White Screen of Death) ao tentar renderizar o histórico do mês passado.

**Phase to address:**
Phase: Modelagem e Banco de Dados (Despesas)

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Processar DRE no JS client-side | Mais rápido de codar | Trava a aba do navegador do usuário quando houver +2.000 transações | Nunca (usar Prisma aggregations) |
| Recibos PDFs salvos em bucket público do Supabase | Simplifica a geração e o link de download | Violação grave de privacidade (LGPD); URLs podem ser vazadas | Nunca (usar bucket privado ou streaming on-the-fly) |
| Ignorar soft-deletes (`deletedAt`) nas despesas | Reduz complexidade das queries no Prisma | Impossível realizar auditoria se um assistente deletar dados maliciosamente | Nunca (seguir a regra de arquitetura `deletedAt` + `deletedByAccountId`) |

## Integration Gotchas

Common mistakes when connecting external/internal services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Storage (PDFs) | Fazer upload do PDF e depois gerar URL assinada para download imediato | Se o PDF não precisa de arquivamento permanente, retorne o buffer diretamente via Server Action/Route Handler e faça o download client-side. Se precisar, use RLS estrito no bucket. |
| Prisma Aggregations | Fazer `findMany()` de todas as despesas e rodar `array.reduce()` no servidor | Usar `prisma.transaction.aggregate({ _sum: { amount: true } })` para deixar o PostgreSQL fazer a matemática rápida. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Paginação infinita sem virtualização em "Relatórios" | Navegador lento, alto consumo de RAM na lista de fluxo de caixa | Usar paginação tradicional para finanças ou react-window se for um scroll longo. | +500 transações renderizadas |
| Consultas N+1 nas Categorias de Despesa | Load da tela de finanças demora segundos | Usar `include: { category: true }` no Prisma em vez de buscar a categoria em cada item iterado. | +50 despesas por tela |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| IDOR no Download do Recibo (`/api/receipt?id=123`) | Paciente A adivinha o ID e baixa o recibo do Paciente B, contendo CPF e valores | Sempre verificar se a transação solicitada pertence ao `workspaceId` da sessão logada no Route Handler. |
| Dados sensíveis vazados via Server Actions | O objeto `Transaction` inteiro é retornado para a UI, incluindo metadados internos ou logs de auditoria | Retornar apenas um DTO/ViewModel com os campos estritamente necessários para a UI (`Omit<Transaction, '...'>`). |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Deletar despesa sem confirmação ou com alerta intrusivo | O usuário tem medo de clicar, ou clica errado e perde dados sem volta | Usar exclusão otimista com um Toast de "Desfazer" (Undo) por 5 segundos. |
| Esconder totalizadores DRE atrás de abas/filtros complexos | O psicólogo não consegue ver rapidamente se o mês foi de lucro ou prejuízo | Cards fixos de "Receitas", "Despesas" e "Saldo" sempre visíveis no topo, atualizados conforme o filtro. |
| Usar jargão contábil no fluxo principal | O psicólogo (que não é contador) fica confuso com "DRE", "Passivo", "Ativo" | Usar linguagem acessível e direta: "Entradas", "Saídas", "Lucro do Mês", "Relatório Consolidado". |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Modals/Drawers:** Faltando o "Focus Trap" e fechamento com a tecla `Escape` — verifique acessibilidade por teclado (WCAG 2.1 AA).
- [ ] **PDF Receipts:** Faltando quebra de página automática para descrições de atendimento muito longas — verifique se o texto é cortado ao meio.
- [ ] **Relatórios:** Faltando o correto tratamento de fuso horário (Timezone) — verifique se transações feitas às 23:00 do último dia do mês não estão caindo no mês seguinte devido a UTC vs America/Sao_Paulo.
- [ ] **Despesas:** Faltando o estado vazio (Empty State) — verifique como a tela aparece no primeiro acesso do usuário (sem dados).

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Migração quebra transações antigas | HIGH | Paralisar os deploys; restaurar o banco via Point-in-Time Recovery (PITR) do Supabase; corrigir script de migração usando `UPDATE` statements de backfill antes de exigir campos NOT NULL. |
| Modal prende o histórico do navegador | LOW | Substituir `useState` por uma lib como `nuqs` para sincronizar a visibilidade do modal com a querystring da URL via hotfix. |
| PDFs falhando na Vercel (Timeouts) | MEDIUM | Migrar a lógica para uma Edge Function mais leve ou retornar a geração de PDFs para o client-side (usando blob) como medida emergencial até a infraestrutura ser reescrita. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Modais quebrando navegação / sem URL state | Refatoração UX/UI Finanças | Tentar usar o botão "Voltar" do navegador com o modal aberto (deve fechar o modal, não sair do app). |
| Estrutura de banco rígida quebrando dados antigos | Modelagem de Despesas & Banco de Dados | Executar a nova branch contra uma cópia do banco de dados de staging (com dados legados reais) antes do PR. |
| Timeouts na geração de PDF | Emissão de Recibos PDF | Testar a emissão de um recibo longo em ambiente Vercel Preview simulando conexão 3G. |
| Vazamento de dados / DRE sem `workspaceId` | Relatórios Consolidados | Escrever testes de integração no Vitest garantindo que repositório retorna erro ou array vazio se um `workspaceId` alheio for usado. |
| IDOR em rotas de download/PDF | Emissão de Recibos PDF | Realizar chamada na API forçando um `receipt_id` válido de outro workspace; a API deve retornar 403/404. |

## Sources

- [Projeto Next.js / Vercel Serverless Limits Documentation]
- [Next.js Intercepting Routes & Nuqs (URL State Management)]
- [Prisma Analytics & Aggregations Best Practices]
- [Supabase RLS & Storage Security Guidelines]
- [Arquitetura interna PsiVault (Repository Pattern, Soft Deletes)]

---
*Pitfalls research for: Módulo de Despesas, Emissão de Recibos PDF, Relatórios Consolidados, Refatoração UX/UI Finanças (PsiVault)*
*Researched: 2026-04-21*