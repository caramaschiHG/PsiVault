# Phase 40: integracao-atendimentos - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 40-integracao-atendimentos
**Areas discussed:** Exibição do vínculo, Navegação de volta

---

## Exibição do vínculo com atendimento

| Option | Description | Selected |
|--------|-------------|----------|
| Badge discreto com data/hora do atendimento | Tag secundária ao lado do tipo do documento, mantém lista limpa | ✓ |
| Linha de meta separada abaixo do cabeçalho | Exibe 'Vinculado ao atendimento de...' como linha própria com link | |
| Agrupar documentos sob o atendimento na timeline | Documentos aparecem aninhados com o atendimento correspondente | |

**User's choice:** Badge discreto com data/hora do atendimento
**Notes:** Prioridade em manter a timeline de documentos escaneável e limpa. Badge deve ser visualmente secundário ao status do documento.

---

## Exibição do vínculo — A4 / PDF

| Option | Description | Selected |
|--------|-------------|----------|
| Cabeçalho clínico estendido | Acrescentar linha ao cabeçalho existente com data/hora/modalidade do atendimento | |
| Seção dedicada no corpo do documento | Inserir seção 'Dados do Atendimento' após o cabeçalho | |
| Apenas na visualização digital, não no PDF | Vínculo aparece como badge na tela, mas não é impresso no PDF | ✓ |

**User's choice:** Apenas na visualização digital, não no PDF
**Notes:** Documentos formais mantêm formato tradicional. O vínculo com atendimento é para uso interno/contexto clínico, não para inclusão em documentos entregues ao paciente.

---

## Exibição do vínculo — Interatividade do badge

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, leva para a agenda filtrada | Link para /agenda com o dia do atendimento em foco | ✓ |
| Não, é apenas informativo | Badge estático sem interação | |

**User's choice:** Sim, leva para a agenda filtrada por aquele paciente na data
**Notes:** Permite ao psicólogo rever o contexto da sessão rapidamente.

---

## Exibição do vínculo — Posição na visualização A4 digital

| Option | Description | Selected |
|--------|-------------|----------|
| Acima do papel, fora da área A4 | Meta-informação acima do documento simulado, na área cinza da página | ✓ |
| No cabeçalho do documento, dentro do papel A4 | Incluído no topo do documento junto com profissional/paciente/data | |

**User's choice:** Acima do papel, fora da área A4
**Notes:** Não interfere no layout formal do documento. Separar claramente meta-informação da interface do conteúdo do documento.

---

## Exibição do vínculo — Exclusão do atendimento

| Option | Description | Selected |
|--------|-------------|----------|
| Preservar ID com indicação de 'atendimento removido' | Documento mantém appointmentId, mas UI exibe 'Atendimento removido' em cor neutra | ✓ |
| Tornar appointmentId nullable e limpar na exclusão | Documentos vinculados perdem o vínculo (appointmentId → null) | |
| Soft delete do atendimento mantém visibilidade | Se atendimento usar soft delete, documento resgata dados do atendimento arquivado | |

**User's choice:** Preservar ID com indicação de 'atendimento removido'
**Notes:** Não quebra o documento. O vínculo histórico é preservado no banco mesmo que o atendimento seja excluído.

---

## Navegação de volta — Redirect após salvar

| Option | Description | Selected |
|--------|-------------|----------|
| De volta para a agenda, no dia do atendimento | Mantém contexto de fluxo da sessão | |
| Para a página do documento criado | Mostra documento finalizado em A4 | |
| De volta para a página do paciente, aba Documentos | Centraliza no prontuário do paciente | ✓ |

**User's choice:** De volta para a página do paciente, aba Documentos
**Notes:** Centraliza o retorno no prontuário. O psicólogo vê o novo documento na timeline do paciente.

---

## Navegação de volta — Botão Voltar durante edição

| Option | Description | Selected |
|--------|-------------|----------|
| Respeita 'from' — volta para onde veio | Parâmetro from controla o breadcrumb de volta | ✓ |
| Sempre volta para o paciente, aba Documentos | Padrão consistente independente de origem | |
| Dois botões: 'Voltar' (origem) e 'Cancelar' (paciente) | Mais flexível, mas mais complexo na UI | |

**User's choice:** Respeita 'from' — volta para onde veio
**Notes:** Se veio da agenda, volta para agenda. Se veio do paciente, volta para paciente. Comportamento previsível baseado na origem.

---

## Navegação de volta — Deep link sem 'from'

| Option | Description | Selected |
|--------|-------------|----------|
| Volta para o paciente, aba Documentos | Fallback padronizado para a página do paciente | ✓ |
| Volta para /patients (lista geral) | Fallback mais genérico | |

**User's choice:** Volta para o paciente, aba Documentos
**Notes:** Comportamento previsível quando o link é copiado ou compartilhado.

---

## Claude's Discretion

- Ponto de partida do fluxo (de onde na agenda/paciente o usuário inicia criação de documento vinculado)
- Pre-fill específico por tipo de documento ao criar a partir de atendimento
- Quantidade de sessões no passado a considerar para pre-fill de relatórios (APPT-04)
- Exatidão do filtro da agenda ao clicar no badge

## Deferred Ideas

- Dashboard global `/documentos` — Fase 41
- Full-text search em metadados — v2
- Exportação em lote — v2
