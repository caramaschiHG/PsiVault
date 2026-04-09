# Fluxo Documental — Análise UX e Plano de Refatoração

## Contexto do Usuário (Psicanalista)

O psicanalista trabalha em **fluxo**, não em telas isoladas. Ele precisa:
1. **Registrar** notas durante/após sessões (rápido, sem fricção)
2. **Consultar** histórico do paciente (linha do tempo clara)
3. **Gerar** documentos formais (laudos, declarações, contratos)
4. **Comunicar** com pacientes (lembretes, envio de documentos)
5. **Acompanhar** financeiro (cobranças, pagamentos)

Tudo isso deve ser **contínuo**, sem saltos entre páginas desconexas.

---

## Problemas Identificados (UX Audit)

### 🔴 CRÍTICOS

#### 1. Página do Paciente = "Parede de Informação"
- **Problema**: A página `/patients/[id]` é uma **lista vertical de 9 seções** sem hierarquia visual clara
- **Impacto**: Cognitive overload, scroll infinito, difícil encontrar o que precisa
- **Solução**: Agrupar em abas/tabs (Visão Geral, Clínico, Documentos, Financeiro)

#### 2. Clinical Timeline = Poluído e Confuso
- **Problema**: Cards com **muita informação** (data, duração, care mode, status, chips, comunicação, links)
- **Impacto**: Dificuldade de escanear rapidamente o histórico
- **Solução**: Simplificar cards — só data + status + badge de nota. Comunicacao em drawer/modal sob demanda

#### 3. DocumentsSection = Lista Plana sem Contexto
- **Problema**: Lista simples sem filtros, busca, agrupamento por tipo/data
- **Impacto**: Difícil encontrar documento específico em pacientes com muitos docs
- **Solução**: Agrupar por tipo, filtro por data, busca por tipo

#### 4. Document Composer = Textarea Básica
- **Problema**: Textarea com toolbar minimalista (uppercase, bullet, indent) — parece editor de texto dos anos 2000
- **Impacto**: Experiência de escrita clínica é **desprazerosa**
- **Solução**: Editor rico com formatação real, preview, templates visuais

#### 5. Note Composer = Sem Feedback Visual de Auto-Save
- **Problema**: Auto-save existe (localStorage) mas **não há indicador visual** visível
- **Impacto**: Psicanalista não sabe se está seguro, ansiedade sobre perda de dados
- **Solução**: Badge "Salvo localmente" + "Salvo no servidor" com timestamps

### 🟡 IMPORTANTES

#### 6. Sem Breadcrumbs ou Navegação Hierárquica
- **Problema**: Ao entrar em documento > edição > visualização, não há breadcrumbs claros
- **Impacto**: Perda de contexto, "onde eu estou?"

#### 7. Sem Quick Actions ou Atalhos de Fluxo
- **Problema**: Para criar nota de sessão, precisa: Patients > [paciente] > Timeline > "Registrar prontuário"
- **Impacto**: 4 cliques para ação mais comum do sistema
- **Solução**: Quick action no agenda (ao marcar COMPLETED > "Criar nota" inline)

#### 8. Documents = Sem Preview ou Thumbnail
- **Problema**: Para ver conteúdo do documento, precisa navegar para página dedicada
- **Impacto**: Friction para revisão rápida

#### 9. Sem Keyboard Shortcuts para Ações de Fluxo
- **Problema**: Navegação toda por clique, sem atalhos para ações frequentes
- **Solução**: `N` = nova nota, `D` = novo documento, `E` = editar paciente

#### 10. ExportSection = Fluxo Destrutivo sem Undo
- **Problema**: Exportação exige digitar "EXPORTAR" + senha — bom para segurança, mas sem feedback visual do progresso
- **Impacto**: Ansiedade durante exportação longa

---

## Princípios de Design para Psicanalistas

### 1. **Fluxo > Telas**
O psicanalista não "navega" — ele **flui** entre sessão > nota > documento > comunicação. Cada tela deve ter um **próximo passo óbvio**.

### 2. **Menos é Mais (Cognitive Load)**
Cada tela deve responder **uma pergunta**:
- Timeline: "Quando foi a última sessão? Tem nota?"
- Documentos: "Quais documentos existem? Qual o tipo?"
- Nota: "O que preciso registrar?"

### 3. **Confiança no Sistema**
- Auto-save visível
- Confirmação de ações
- Feedback de progresso
- Undo disponível

### 4. **Escaneabilidade**
Psicanalista **escaneia** antes de ler. Cards devem ter:
- Um título claro
- Um badge de status
- Uma ação primária
- Zero ruído visual

---

## Plano de Refatoração (por Prioridade)

### FASE 1: Quick Wins (Maior Impacto / Menor Esforço)

#### 1.1. Visual Auto-Save Feedback no Note Composer
- Badge no canto superior direito: "💾 Salvo localmente às 14:32"
- Quando salvo no servidor: "✅ Salvo no servidor"
- Quando pendente: "⏳ Não salvo ainda"

#### 1.2. Simplificar ComunicacaoGroup no Timeline
- Colocar ComunicacaoGroup dentro de `<details>` colapsável
- Card mostra apenas: data + status + badge nota
- Comunicacao só aparece se usuário expandir

#### 1.3. Adicionar Breadcrumbs em Documentos
- `Pacientes > Fulano > Documentos > Novo > Laudo Psicológico`
- Usar componente novo de breadcrumb

#### 1.4. Keyboard Shortcuts para Ações de Fluxo
- `N` = nova nota clínica (na página de sessão)
- `D` = novo documento (no perfil do paciente)
- `E` = editar paciente
- `?` = mostrar atalhos disponíveis

### FASE 2: Refatoração Estrutural

#### 2.1. Patient Profile com Tabs
- **Visão Geral**: Header + Summary Cards + Quick Next Session
- **Clínico**: Timeline + Notas
- **Documentos**: Lista + Filtros + Busca
- **Financeiro**: Cobranças + Histórico
- **Configurações**: Editar + Observações + Exportar

#### 2.2. Timeline Redesign
- Visual tipo "feed" vertical com linha conectora
- Cards simplificados (data, status, nota sim/não)
- Expandir para detalhes sob demanda
- Agrupar por mês/trimestre

#### 2.3. Documents Section Redesign
- Agrupar por tipo (seção colapsável por tipo)
- Filtro por data range
- Busca por tipo
- Preview inline (hover ou click expand)

#### 2.4. Document Composer Redesign
- Toolbar rica com formatação real (usando RichTextEditor existente)
- Preview do documento final (como ficará o PDF)
- Templates visuais (cards clicáveis para SOAP/BIRP/Livre)
- Modo foco com sidebar colapsável

### FASE 3: Experiência Premium

#### 3.1. Session Flow Integrado
- Da Agenda: ao marcar COMPLETED > popup "Registrar nota agora?"
- Do Timeline: ao clicar "Registrar" > abre modal drawer (não nova página)
- Nota salva > volta automaticamente para onde estava

#### 3.2. Dashboard de Documentos
- Página `/documentos` com visão global (todos pacientes)
- Filtros por tipo, data, paciente
- Recentes, pendentes, arquivados

#### 3.3. Smart Suggestions
- Ao criar documento: sugerir conteúdo baseado em documentos anteriores
- Ao criar nota: sugerir temas/evolução baseada em notas anteriores
- Sempre respeitando SECU-05 (sem vazar conteúdo clínico na busca)

---

## Métricas de Sucesso

| Métrica | Atual | Target |
|---------|-------|--------|
| Cliques para criar nota | 4+ | 1-2 |
| Tempo para encontrar documento | 10s+ | 3s |
| Scroll na página do paciente | 3+ páginas | 1 tela |
| Percepção de segurança (auto-save) | Invisível | Visível |
| Cognitive load (cards timeline) | Alto | Baixo |

---

## Tecnologias e Componentes a Criar/Refatorar

### Novos Componentes
- `Breadcrumb` — navegação hierárquica
- `Tabs` — abas de navegação (Visão Geral, Clínico, etc)
- `AutoSaveIndicator` — badge de status de salvamento
- `TimelineEntry` — card de timeline redesenhado
- `DocumentCard` — card de documento com preview
- `KeyboardShortcutHint` — hint visual de atalhos
- `QuickActionPanel` — painel de ações rápidas

### Componentes a Refatorar
- `ClinicalTimeline` — simplificar, agrupar, linha visual
- `DocumentsSection` — agrupar por tipo, filtros
- `DocumentComposerForm` — toolbar rica, preview, templates
- `NoteComposerForm` — auto-save visível, modo foco

### Estilos a Adicionar
- Timeline connector line (CSS pseudo-element)
- Tab active states
- Breadcrumb styles
- Auto-save badge animations
- Keyboard shortcut hint styles
