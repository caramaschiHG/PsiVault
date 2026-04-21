# Architecture Research

**Domain:** Gestão Financeira, Despesas, Emissão de Recibos PDF e Relatórios Consolidados
**Researched:** 2026-04-21
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI & UX Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Finance      │  │ Expense      │  │ Receipt           │  │
│  │ Dashboard    │  │ Drawer       │  │ Modal/Preview     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                   │             │
├─────────┴─────────────────┴───────────────────┴─────────────┤
│                       Server Actions                         │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ app/(vault)/finances/actions.ts                       │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                       Domain & Data Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Finance      │  │ PDF          │  │ Reports           │  │
│  │ Repository   │  │ Generator    │  │ Aggregator        │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `FinanceDashboard` | Visão geral, listagem de charges/despesas e botões de ação | Server Component com Suspense |
| `ExpenseDrawer` | Formulário para criação e edição de despesas (CRUD) | Client Component (Modal/Drawer) |
| `ReceiptGenerator` | Geração do PDF com dados do psicólogo, paciente, CRP e CPF | Função no servidor (ex: `@react-pdf/renderer` ou `pdfmake`) |
| `actions.ts` | Validação de workspace/role, mutations e revalidação de cache | Next.js Server Actions (`"use server"`) |
| `FinanceRepository` | Interação com o Prisma (Expenses, Receipts, SessionCharges) | `repository.prisma.ts` implementando interface |

## Recommended Project Structure

```
src/
├── app/(vault)/finances/           # Core Route
│   ├── page.tsx                    # Dashboard principal (Renders layout and Suspense boundaries)
│   ├── actions.ts                  # Server actions (createExpense, generateReceipt)
│   └── _components/                # Componentes isolados da UI de Finanças
│       ├── ExpenseDrawer.tsx       # UI para lançar/editar despesas
│       ├── ReceiptModal.tsx        # UI para selecionar sessões e emitir recibo
│       └── CashFlowChart.tsx       # Visualização DRE simples
├── lib/finances/                   # Domain Logic
│   ├── model.ts                    # Modelos canônicos (Expense, Receipt, CashFlowReport)
│   ├── repository.ts               # Interfaces do repositório
│   ├── repository.prisma.ts        # Implementação Prisma (com consultas e agregações)
│   └── pdf-generator.ts            # Serviço de renderização de PDF isolado
```

### Structure Rationale

- **`app/(vault)/finances/`:** Segue o padrão App Router agrupando UI e actions no mesmo módulo de feature, mantendo Server Actions co-localizadas com quem as consome.
- **`_components/`:** Garante que a complexidade de client-side state (abrir/fechar modais) fique isolada do Server Component principal (`page.tsx`), melhorando performance e reduzindo o bundle.
- **`lib/finances/`:** Mantém o padrão Repository do projeto, separando regras de negócios e abstrações de banco de dados de qualquer framework UI.

## Architectural Patterns

### Pattern 1: Drawer-based CRUD (Refatoração UX)

**What:** Utilização de Drawers (painéis laterais ou modais) em vez de formulários inline (expansão de linha de tabela) ou páginas separadas para edição.
**When to use:** Para criar ou editar despesas (`Expenses`) e gerenciar pagamentos sem tirar o usuário do contexto visual do relatório/dashboard financeiro.
**Trade-offs:** Exige controle de estado local (isOpen) e gerenciamento de foco (Acessibilidade WCAG 2.1 AA), mas melhora massivamente a usabilidade e navegação.

**Example:**
```tsx
// app/(vault)/finances/_components/ExpenseDrawer.tsx
"use client"
import { useState } from "react";
import { createExpense } from "../actions";

export function ExpenseDrawer() {
  const [open, setOpen] = useState(false);
  
  async function action(formData: FormData) {
    await createExpense(formData);
    setOpen(false);
  }
  
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <form action={action}>...</form>
    </Drawer>
  );
}
```

### Pattern 2: On-the-fly PDF Generation (Recibos)

**What:** Não armazenar o arquivo binário do PDF no banco de dados (`PracticeDocument` ou Storage). Em vez disso, registrar apenas um registro lógico de `Receipt` (com snapshot de valor e data) e gerar o PDF dinamicamente em memória sempre que solicitado.
**When to use:** Na emissão de recibos fiscais, onde a formatação e os dados são determinísticos baseados no snapshot salvo.
**Trade-offs:** Aumenta o custo computacional no momento do download/visualização, mas economiza espaço em disco e simplifica a governança de dados e retificações.

### Pattern 3: Database-Level Aggregation (Relatórios)

**What:** Calcular lucro/prejuízo (Fluxo de Caixa/DRE Simples) usando queries `groupBy` do PostgreSQL/Prisma em vez de instanciar milhares de registros em memória no Node.js.
**When to use:** Na construção do `FinanceDashboard` para buscar totais do mês corrente, receitas projetadas vs. realizadas e soma de despesas.
**Trade-offs:** Queries mais complexas no repositório, mas escala perfeitamente e é ultra eficiente em uso de RAM.

## Data Flow

### Request Flow: Criação de Despesa

```
[User Click: "Nova Despesa"]
    ↓
[ExpenseDrawer (Client)] → submit form → [createExpense() (actions.ts)]
    ↓                                              ↓ (valida auth/workspace)
[Toast: "Despesa salva!"] ← [revalidatePath] ← [FinanceRepository.prisma.ts]
```

### Request Flow: Emissão de Recibo PDF

```
[User Click: "Gerar Recibo"]
    ↓
[ReceiptModal] → call → [generateReceiptPdf() (actions.ts)]
    ↓                           ↓
[Browser Blob/Download] ← [pdf-generator.ts] ← [FinanceRepository fetches patient/clinic info]
```

### Key Data Flows

1. **Geração de DRE Simples:** O `page.tsx` consome o `FinanceRepository.getMonthlyCashFlow()`. O repositório faz duas queries paralelas: soma dos `SessionCharge` (amountInCents) onde `status = 'pago'` e soma das `Expense` (amountInCents) do mesmo mês. O modelo calcula `Receita - Despesa`.
2. **Snapshot de Recibo:** Ao emitir um recibo para uma ou mais sessões (`SessionCharge`), cria-se um registro `Receipt` que linka aos IDs da(s) sessão(ões), registrando o valor exato, para que alterações futuras na sessão ou perfil do psicólogo não alterem recibos emitidos no passado (Princípio de Imutabilidade Contábil).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Geração sincrona de PDF na própria rota/Action bloqueando a thread brevemente. Agregações feitas direto na tabela. |
| 1k-10k users | Se a geração de PDF ficar pesada, migrar a geração do buffer de PDF para uma Edge Function dedicada ou serviço serverless para não travar o Node.js Event Loop. |

### Scaling Priorities

1. **First bottleneck (PDF Generation):** Bibliotecas pesadas (ex: `@react-pdf/renderer` tem bundle grande no node). A solução é assegurar que o PDF generator seja importado dinamicamente ou mantido estritamente no Server (nunca vaze para o Client Bundle, mantendo os atuais 102 kB compartilhados de JS).
2. **Second bottleneck (Dashboard Load Time):** Consultas de agregação de fluxo de caixa podem ficar lentas ao longo dos anos. A solução é indexar adequadamente os campos de data e workspace (`@@index([workspaceId, date])` nas novas tabelas de `Expense` e `Receipt`).

## Anti-Patterns

### Anti-Pattern 1: Edição Inline Complexa
**What people do:** Permitem editar detalhes da despesa ou recibo diretamente na linha da tabela de finanças.
**Why it's wrong:** Polui a interface visualmente, atrapalha a responsividade mobile e torna o estado do React muito difícil de manter sincronizado com server actions.
**Do this instead:** Use modais e drawers centralizados (`ExpenseDrawer`) que atuam como formulários desacoplados e disparam mutations limpas.

### Anti-Pattern 2: Salvar arquivos PDF estáticos de Recibos
**What people do:** Geram o PDF do recibo e salvam um arquivo `.pdf` no Supabase Storage.
**Why it's wrong:** Desperdício de cloud storage. Se o psicólogo descobrir que o CRP digitado estava com um typo, todos os PDFs gerados precisariam ser deletados fisicamente.
**Do this instead:** Salve apenas os metadados (quem pagou, quanto, quando, referente a quais consultas) e gere o `.pdf` sob demanda na rota de visualização usando um template imutável.

### Anti-Pattern 3: Cálculos de Finanças com Floats (Decimais)
**What people do:** Usar campos `Float` (ou Prisma `Decimal`) para dinheiro e fazer math básico no JS (`10.10 + 20.20 = 30.299999999999997`).
**Why it's wrong:** Bugs de ponto flutuante em relatórios financeiros destroem a confiança no produto (Core Value do PsiVault).
**Do this instead:** Mantenha a convenção atual do sistema de lidar com valores apenas em centavos (Inteiros): `amountInCents`. Divida por 100 estritamente na hora de formatar na UI.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `Finances` ↔ `Appointments/Patients` | Banco de Dados / Repositório | A geração de recibos precisa acessar dados de `PracticeProfile` (CPF/CRP do Psi), `Patient` (CPF) e `SessionCharge`. Todos os dados carregados devem ter escopo obrigatório de `workspaceId`. |

## Suggested Build Order

1. **Schema Updates:** Adicionar models `Expense` e `Receipt` no Prisma Schema e realizar a migração.
2. **Domain/Repository:** Implementar `lib/finances/model.ts` e `lib/finances/repository.prisma.ts`.
3. **PDF Engine:** Criar o serviço isolado `pdf-generator.ts` e testar a saída (Unit tests no Vitest in-memory).
4. **Refatoração UI/UX Base:** Desenhar a nova visualização de Tabela de Finanças (`FinanceDashboard`) com os dados atuais.
5. **Drawers e Forms:** Implementar `ExpenseDrawer` e `ReceiptModal` e conectar as Server Actions.
6. **Relatórios Consolidados:** Construir a interface visual de Fluxo de Caixa / Lucro Mensal (DRE) com os novos dados.

---
*Architecture research for: Gestão Financeira, Recibos e Despesas (Módulo v1.2)*
*Researched: 2026-04-21*