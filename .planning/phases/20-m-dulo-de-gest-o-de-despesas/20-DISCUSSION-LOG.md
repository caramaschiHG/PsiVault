# Phase 20: Módulo de Gestão de Despesas - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 20-Módulo de Gestão de Despesas
**Areas discussed:** Modelo de dados e categorias, Localização na navegação, Listagem e filtros de despesas, Fluxo de criação (drawer), Edição/exclusão e auditoria

---

## Gray area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Modelo de dados e categorias | Estrutura, recorrência, parcelamento | ✓ |
| Anexo de comprovante (DESP-03) | Storage, tipos, tamanho, obrigatoriedade | (deferido à discreção do agente) |
| Localização na navegação | Aba interna vs rota separada | ✓ |
| Listagem e filtros | Visualização e filtros | ✓ |
| Fluxo de criação (drawer) | Drawer + campos + upload | ✓ |
| Edição, exclusão e auditoria | Política de edição, soft delete, AuditEvent | ✓ |

---

## Modelo de dados e categorias

### Categorias

| Option | Description | Selected |
|--------|-------------|----------|
| Tabela ExpenseCategory própria + seed | Workspace-scoped, editável, max flexibilidade | ✓ |
| Enum fixo no código | Lista fechada, simples mas inflexível | |
| Campo string livre + autocomplete | Sem tabela, sem gestão | |

**User's choice:** Tabela ExpenseCategory própria, editada pelo usuário + seed inicial

### Recorrência inclusion

| Option | Description | Selected |
|--------|-------------|----------|
| Só lançamento único nesta fase | Recorrência fica para fase futura | |
| Suportar recorrência desde já | Modelar seriesId + pattern como Appointment | ✓ |

**User's choice:** Suportar recorrência desde já

### Padrões de recorrência

| Option | Description | Selected |
|--------|-------------|----------|
| Mensal + Quinzenal | Cobre 95% (aluguel, supervisão) | ✓ |
| Mensal + Quinzenal + Anual | Inclui anuidade CRP, seguros | |
| Apenas mensal | Mais simples | |

**User's choice:** Mensal + Quinzenal

### Materialização

| Option | Description | Selected |
|--------|-------------|----------|
| Materializar 12 meses adiante | Cada instância editável individualmente, padrão Appointment | ✓ |
| Só a regra; instanciar sob demanda | Mais leve, dificulta editar instância específica | |

**User's choice:** Materializar instâncias futuras (ex: 12 meses adiante)

### Comprovante em série

| Option | Description | Selected |
|--------|-------------|----------|
| Por instância | Cada mês tem seu boleto/recibo | ✓ |
| Da série inteira | Template (ex: contrato), instâncias herdam | |

**User's choice:** Comprovante é por instância

---

## Localização na navegação

### Local do módulo

| Option | Description | Selected |
|--------|-------------|----------|
| Nova aba dentro de /financeiro | Reaproveita Tabs/header/seletor de mês; combina com DRE futuro | ✓ |
| Rota separada /financeiro/despesas com sidebar item | Mais espaço pra crescer | |
| Sub-rota sem item separado na sidebar | Híbrido | |

**User's choice:** Nova aba dentro de /financeiro

### CRUD de Categorias

| Option | Description | Selected |
|--------|-------------|----------|
| Modal acionado de dentro da página de despesas | Sem poluir sidebar nem rota nova | ✓ |
| Página dentro de Configurações | Coerente com configs do workspace | |
| Inline no drawer de despesa | Sem tela dedicada | |

**User's choice:** Modal acionado de dentro da página de despesas

---

## Listagem e filtros de despesas

### Visualização

| Option | Description | Selected |
|--------|-------------|----------|
| Lista cronológica densa, categoria como badge | Consistência total com Receitas | |
| Agrupada por categoria com subtotais | Bom pra entender pra onde vai dinheiro | |
| Cronológico com toggle para agrupar por categoria | Dá ambos | ✓ |

**User's choice:** Cronológico com toggle para agrupar por categoria

### Filtros

| Option | Description | Selected |
|--------|-------------|----------|
| Mês/ano + filtro por categoria | Mínimo viável, consistente | |
| Mês + categoria + valor + busca textual | Mais poder | ✓ |
| Apenas mês/ano | Filtros entram na Phase 22 | |

**User's choice:** Mês + categoria + valor + busca textual

### Resumo do mês

| Option | Description | Selected |
|--------|-------------|----------|
| StatCards básicos: total, # despesas, maior categoria | Reaproveita componente; sem gráfico | ✓ |
| Total + comparação mês anterior + mini gráfico de pizza | Mais rico | |
| Sem resumo — tudo na Phase 22 | Mínimo | |

**User's choice:** StatCards básicos: total do mês, # despesas, maior categoria

---

## Fluxo de criação (drawer)

### Padrão de criação

| Option | Description | Selected |
|--------|-------------|----------|
| Drawer lateral via URL (?drawer=despesa-nova) | Padrão Phase 19; consistência total | ✓ |
| Página dedicada /financeiro/despesas/nova | Mais espaço, quebra contexto | |
| Form inline no topo da lista | Anti-padrão removido na Phase 19 | |

**User's choice:** Drawer lateral via URL (`?drawer=despesa-nova`)

### Campos no drawer

| Option | Description | Selected |
|--------|-------------|----------|
| Data, valor, descrição, categoria, recorrência (toggle), comprovante (opcional) | Mínimo viável + recorrência inline | ✓ |
| Acima + status (paga/a pagar) + data de pagamento | Conceito pendente/pago como SessionCharge | |
| Campos básicos; recorrência em segundo passo | Mais limpo, mais cliques | |

**User's choice:** Data, valor, descrição, categoria, recorrência (toggle), comprovante (opcional)

### Upload do comprovante

| Option | Description | Selected |
|--------|-------------|----------|
| No mesmo drawer, após salvar (cria → anexa) | Permite criar sem comprovante e anexar depois | ✓ |
| Inline desde o início (salva tudo junto numa transação) | Tudo de uma vez | |
| Ação separada via menu na lista | Drawer só cuida de campos | |

**User's choice:** No mesmo drawer, após salvar (cria → anexa)

---

## Edição, exclusão e auditoria

### Política de edição

| Option | Description | Selected |
|--------|-------------|----------|
| Edição livre via drawer | Sem restrição temporal; corrige antigos | ✓ |
| Edição restrita ao mês corrente | Preserva integridade contabilística | |

**User's choice:** Edição livre via drawer

### Edição/exclusão em série recorrente

| Option | Description | Selected |
|--------|-------------|----------|
| Perguntar escopo (esta / esta+futuras / toda série) | Padrão Google Calendar | ✓ |
| Sempre só a instância (sem propagação) | Mais simples | |

**User's choice:** Perguntar escopo (esta / esta+futuras / toda série)

### Exclusão

| Option | Description | Selected |
|--------|-------------|----------|
| Soft delete (padrão do projeto) | deletedAt + deletedByAccountId | ✓ |
| Hard delete | Mais simples, perde rastro | |

**User's choice:** Soft delete (padrão do projeto)

### Auditoria

| Option | Description | Selected |
|--------|-------------|----------|
| Auditar tudo + nunca logar valor (segue SECU-05) | Eventos completos respeitando privacidade financeira | ✓ |
| Só create/delete (sem update) | Reduz volume | |

**User's choice:** Auditar tudo + nunca logar valor (segue SECU-05)

---

## the agent's Discretion

- Decisões finas sobre anexo de comprovante (RLS, tipos MIME, tamanho máx, preview, cleanup)
- Estilo visual exato dos badges de categoria
- Estrutura interna do drawer e do modal de categorias
- Estratégia de invalidação de cache (revalidatePath vs revalidateTag)
- Mensagem do modal de confirmação de escopo de série
- Implementação técnica do toggle cronológico/por categoria

## Deferred Ideas

- Recorrência anual
- Status de pagamento na despesa (paga/a pagar)
- Vincular despesa a paciente específico
- Centro de custos / rateio (Out of Scope explícito)
- Exportação CSV/IRPF (Phase 22)
- Gráficos de evolução (Phase 22)
- Edição congelada de meses anteriores
