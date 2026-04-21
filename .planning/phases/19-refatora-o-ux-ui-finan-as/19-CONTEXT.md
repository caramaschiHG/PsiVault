# Phase 19: Refatoração UX/UI Finanças - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Refatoração da UX/UI da aba de finanças, focando em usabilidade para gerenciamento de cobranças (inadimplência e atrasos), substituindo a interação baseada em formulários inline por padrões consolidados de Drawers/Modais integrados via URL. Esta fase não implementa módulos novos como despesas ou relatórios complexos, apenas ajeita a fundação visual do fluxo financeiro atual.

</domain>

<decisions>
## Implementation Decisions

### Estrutura de Visualização
- **D-01:** Lista simples (estilo Extrato Bancário) deve ser adotada para melhorar a facilidade de scan das cobranças e transações, com maior densidade que cards.

### Padrão de Interação
- **D-02:** O padrão de edição/detalhe de cobrança usará Drawers laterais (deslizando da direita) que permitem que a lista principal continue parcialmente visível/contextualizada, consistente com o que já foi usado na Agenda.

### Destaque de Inadimplência
- **D-03:** Aba separada exclusiva para as pendências em atraso para facilitar o gerenciamento focado do psicólogo em quem está devendo.

### Gestão de Estado
- **D-04:** A exibição e o estado dos Drawers devem ser gerenciados através de parâmetros de URL (ex: `?drawer=cobranca-123`). Isso previne quebras da navegação com o botão Voltar do browser e atende ao requisito de deep-linking (UXFI-03).

### the agent's Discretion
- Componentes e estilo exatos do Drawer, além dos ícones e textos para a Aba de Inadimplência.
- O nome exato das tabs/abas no cabeçalho e componentes internos.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` § UX Finanças — Referência direta para UXFI-01 e UXFI-02.
- `.planning/PROJECT.md` § Current Milestone — Para manter alinhamento com escopo de Refatoração.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` e `src/components/ui/list.tsx`: Para a construção da lista simples/extrato.
- `src/components/ui/tabs.tsx`: Para implementar a aba separada de inadimplência.
- `src/app/(vault)/agenda/components/appointment-side-panel.tsx`: Exemplo da implementação atual do `<dialog>` como Drawer (uso do estilo `side-panel-drawer` e `--z-modal`). Serve de guia para o novo padrão.

### Established Patterns
- Componentes modais ou drawers na aplicação não dependem de bibliotecas pesadas e costumam usar a tag semântica `<dialog>` e Focus Trapping interno (`keydown` listener).
- Uso de CSS Tokens (`--z-modal`) e classes inline para styling em vez de Tailwind.

### Integration Points
- `src/app/(vault)/financeiro/page.tsx` (e `page-client.tsx`): Locais diretos de aplicação destas mudanças de refatoração, mantendo e aprimorando a exibição e listagem de dados lá buscados.

</code_context>

<specifics>
## Specific Ideas

- Fazer a lista de cobranças lembrar a estética de um "extrato bancário" focado em scaneabilidade.
- O Drawer deve surgir da direita mantendo o visual similar ao "appointment-side-panel" utilizado na Agenda.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 19-Refatoração UX/UI Finanças*
*Context gathered: 2026-04-21*