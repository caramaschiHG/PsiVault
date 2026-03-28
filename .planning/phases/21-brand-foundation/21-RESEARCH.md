# Phase 21: Brand Foundation - Research

**Researched:** 2026-03-28
**Domain:** CSS design tokens, documentação de marca, tipografia editorial, refinamento de sidebar
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Superfície de demonstração**
- Aplicar na sidebar (`vault-sidebar-nav.tsx`) — visível em toda sessão autenticada
- Redesign **parcial**: além dos novos tokens de cor, ajustar tipografia (pesos, uso de serif onde cabível) e espaçamento (mais respiro)
- Layout e estrutura da sidebar não mudam — só aparência visual

**Conteúdo do CLAUDE.md**
- Adicionar seção nova **"Posicionamento Psicanalítico"** separada da seção existente "Direção de Marca — Landing PsiVault"
- Seção deve cobrir:
  - **Vocabulário obrigatório**: termos clínicos corretos (`paciente` não `cliente`, `atendimento` não `serviço`, `prontuário` não `ficha`) e termos psicanalíticos usados corretamente (`acompanhamento`, `escuta`, `transferência` — em contexto)
  - **Anti-padrões de tom**: frases proibidas (`revolucione`, `potencialize`, `IA que entende você`), linguagem de coach/wellness, slogans vazios
  - **Regras do plano premium**: o assistente de pesquisa resume conceitos e indica obras, não reproduz textos protegidos, não faz diagnósticos, não simula analista
  - **Limites de copyright**: resumos e conceitos são ok; citações longas não; não reproduzir capítulos ou obras completas — regras gerais, sem listar autor por autor
- Manter seção "Direção de Marca — Landing PsiVault" existente intocada (cobre a landing)

**Nome de produto**
- **PsiVault** é o nome de produto para UI, copy, landing e comunicação com usuário
- **PsiLock** é o nome técnico/repo (código, variáveis, paths, documentação interna de dev)
- CLAUDE.md deve fixar essa distinção explicitamente para evitar inconsistência em copy gerado por AI

**Tipografia editorial**
- IBM Plex Serif para **h1 e h2 de páginas de conteúdo clínico** (prontuário, paciente, sessão) — não em navegação, labels ou formulários
- Escala de tamanhos atual (24/16/15/13/12px) **mantida** — não reescrever
- Refinar **pesos**: mais uso de 500/600 para hierarquia clara; não depender só de tamanho
- Refinar **line-height**: mais generoso para texto corrido e títulos (editorial, não compacto)
- IBM Plex Serif aplicado **somente via `var(--font-serif)`** ou classe explícita — nenhum elemento usa serif por padrão via seletor global

**Espaçamento generoso**
- `--space-section-gap`: aumentar de `1.5rem` para `2rem`
- `--space-row-height`: aumentar de `3.5rem` para `4rem`
- `--space-page-padding-x` (2.5rem) já está adequado — não mudar

**Anti-padrões visuais internos**
- Adicionar seção no CLAUDE.md com regras para o app interno (não só landing):
  - Sem gradientes decorativos em superfícies funcionais
  - Sombras contidas (`--shadow-sm` e `--shadow-md`) — nunca exageradas para "efeito"
  - Animações só quando melhoram orientação ou resposta de interação — não decorativas
  - Sem badges, chips coloridos ou indicadores de "novidade" sem função real
  - Hierarquia via tipografia e espaçamento — não via cor excessiva

### Claude's Discretion

Nenhuma área de discrição explicitada — todas as decisões estão bloqueadas.

### Deferred Ideas (OUT OF SCOPE)

- Migração completa para paleta charcoal/sage — a direção existe, mas a fase 21 não troca cores do app; isso acompanha a landing (fase 22+)
- Redesign do dashboard — fora do escopo desta fase, que cobre só sidebar como demonstração
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRAND-01 | O CLAUDE.md do projeto contém o posicionamento psicanalítico, vocabulário obrigatório, anti-padrões de tom e as regras explícitas do plano premium (o que o AI faz / não faz, limites de copyright) | Estrutura da nova seção mapeada; conteúdo específico identificado no CONTEXT.md |
| BRAND-02 | A direção visual está documentada em tokens/globals.css — paleta off-white/charcoal/sage, tipografia editorial forte, espaçamento generoso — e aplicada consistentemente | Tokens existentes auditados; deltas exatos identificados; sidebar como superfície de demonstração confirmada |
</phase_requirements>

---

## Summary

Esta fase é inteiramente de edição de arquivos existentes: CLAUDE.md recebe uma nova seção de posicionamento psicanalítico, globals.css recebe ajustes pontuais de dois tokens de espaçamento e refinamentos de line-height/weight, e vault-sidebar-nav.tsx (mais vault-layout.tsx) recebe ajustes tipográficos e de espaçamento que demonstram os tokens refinados.

Não há dependências externas, novas bibliotecas ou infraestrutura a provisionar. IBM Plex Serif já está importado. Todos os tokens CSS já estão em `:root` em `globals.css`. A sidebar já usa variáveis de cor via `.vault-sidebar .nav-link`. O risco técnico é zero — as mudanças são aditivas ou são ajustes de valores numéricos.

O único risco real é de conteúdo: a seção "Posicionamento Psicanalítico" no CLAUDE.md precisa ser precisa e útil para qualquer contribuidor ou agente AI que a consuma. Vocabulário errado ou regras ambíguas propagam inconsistência para todas as fases seguintes.

**Primary recommendation:** Executar em 3 tarefas sequenciais claras — (1) CLAUDE.md, (2) globals.css tokens, (3) sidebar — com verificação visual após a terceira.

---

## Standard Stack

### Core

| Componente | Versão atual | Papel nesta fase |
|------------|-------------|-----------------|
| `globals.css` | — | Fonte única de todos os tokens CSS; edições aqui propagam para todo o app |
| `vault-sidebar-nav.tsx` | — | Superfície de demonstração dos tokens refinados |
| `layout.tsx` (`(vault)`) | — | Contém `sidebarStyle` inline — pode precisar de ajuste de `gap` no brand block |
| `CLAUDE.md` (raiz) | — | Documentação canônica de marca; lida por contribuidores e AI |
| IBM Plex Serif | já importado | Fonte serif editorial; nenhuma dependência nova |

### Tokens a editar em globals.css

| Token | Valor atual | Valor novo | Impacto |
|-------|------------|-----------|---------|
| `--space-section-gap` | `1.5rem` | `2rem` | Espaçamento entre seções em todas as views |
| `--space-row-height` | `3.5rem` | `4rem` | Altura mínima de linhas em listas/tabelas |
| `line-height` body | `1.5` (em `body`) | `1.6` | Texto corrido mais legível |
| Pesos tipográficos | variáveis no CSS | Adicionar tokens `--font-weight-medium: 500` e `--font-weight-semibold: 600` opcionalmente | Hierarquia sem hardcode |

**Não alterar:** escala de tamanhos (24/16/15/13/12px), paleta de cores, shadows, radii.

---

## Architecture Patterns

### Padrão atual de tokens CSS

Todos os tokens vivem em `:root` no início de `globals.css`. Componentes consomem via `var(--token-name)`. Estilos inline em componentes usam `satisfies React.CSSProperties`. Classes utilitárias como `.vault-sidebar .nav-link` estão no próprio `globals.css`.

Este padrão **não muda** nesta fase — apenas valores de tokens existentes são ajustados e a sidebar aplica os refinamentos tipográficos.

### Estrutura da sidebar (atual)

```
layout.tsx (vault)
  └── <aside class="vault-sidebar">       ← backgroundColor: "#2d1810" (inline)
        ├── brand block                   ← inline styles (brandStyle, brandNameStyle)
        ├── <VaultSidebarNav />           ← nav-link classes do globals.css
        └── <SearchBar />
```

**Ponto de atenção:** a cor do sidebar (`#2d1810`) está hardcoded em `sidebarStyle` no `layout.tsx`, não em variável CSS. Para BRAND-02 ("tokens aplicados"), pode-se opcionalmente extrair para `--color-sidebar-bg-dark` em globals.css — mas a decisão do CONTEXT.md fala apenas em ajuste tipográfico/espaçamento, não em mudar a cor. **Não alterar a cor.**

### Onde aplicar os refinamentos na sidebar

Os refinamentos tipográficos da sidebar se traduzem em:

1. **`globals.css` — `.vault-sidebar .nav-link`**: aumentar `gap` de `0.625rem` para `0.75rem`; font-size já é adequado via herança
2. **`layout.tsx` — `brandStyle`**: aumentar `padding` de `"1.25rem 1rem 1rem"` para `"1.5rem 1.25rem 1rem"` para mais respiro no topo
3. **`vault-sidebar-nav.tsx` — `navStyle`**: aumentar `gap` de `"0.25rem"` para `"0.375rem"` entre grupos; `padding` de `"0.5rem 0.75rem"` para `"0.75rem 0.875rem"`

### Padrão de adição de seção no CLAUDE.md

O CLAUDE.md atual tem seções de nível `##`. A nova seção "Posicionamento Psicanalítico" deve ter o mesmo nível, inserida **antes** da seção "Direção de Marca — Landing PsiVault" — ela é mais abrangente (governa todo o produto) enquanto a seção existente é específica para a landing.

### Anti-Patterns to Avoid

- **Não usar seletor global para aplicar serif**: nenhum `h1, h2 { font-family: var(--font-serif) }` global. Serif só via classe explícita ou uso pontual de `var(--font-serif)`.
- **Não mover inline styles para CSS classes** além do pedido: a tarefa é de refinamento, não de refactor.
- **Não criar novos arquivos CSS**: tudo em globals.css ou como propriedade inline.
- **Não alterar a estrutura de navegação da sidebar**: apenas aparência (padding, gap, font-weight).

---

## Don't Hand-Roll

| Problema | Não construir | Usar em vez | Motivo |
|----------|--------------|-------------|--------|
| Fonte serif editorial | importar fonte nova | `var(--font-serif)` já definido | IBM Plex Serif já no Google Fonts import |
| Documentação de marca | arquivo separado | Seção em CLAUDE.md existente | É o padrão do projeto; lido por AI automaticamente |
| Sistema de tokens | arquivo de design tokens separado | `:root` em globals.css | Padrão estabelecido nas fases 13+ |

---

## Common Pitfalls

### Pitfall 1: Escala de tamanhos vs. escala de pesos

**O que dá errado:** Confundir "refinar pesos" com "mudar tamanhos". A escala de tamanhos (24/16/15/13/12px) está bloqueada. Apenas font-weight e line-height mudam.

**Como evitar:** Não tocar em `--font-size-*` tokens. Ajustes são em: `line-height` no seletor `body`, adição de uso explícito de `font-weight: 500/600` onde hierarquia visual está fraca.

### Pitfall 2: Serialização em CLAUDE.md

**O que dá errado:** Escrever as regras de forma vaga ("usar vocabulário clínico") sem exemplos negativos concretos. Agentes AI ignoram instruções ambíguas.

**Como evitar:** Para cada regra de vocabulário, incluir o par "use X, não Y". Para anti-padrões de tom, incluir frases proibidas literais.

### Pitfall 3: line-height no body vs. em tokens

**O que dá errado:** Adicionar um novo token `--line-height-body: 1.6` sem referenciar no seletor `body {}`. O seletor `body` no globals.css usa `line-height: 1.5` diretamente (linha 127), não via variável.

**Como evitar:** Atualizar o valor diretamente no seletor `body` de `1.5` para `1.6`. Se quiser também criar token, criar **e** usar no `body`.

### Pitfall 4: Sidebar — gap vs. padding

**O que dá errado:** Aumentar apenas `--space-section-gap` global (que afeta todas as views) sem verificar o impacto visual nas demais views. O token global `--space-section-gap` é usado em múltiplos lugares.

**Como evitar:** Mudar `--space-section-gap` globalmente conforme decidido (1.5 → 2rem). Para os ajustes específicos da sidebar (gap entre itens de nav), editar diretamente os estilos inline do `navStyle` e o CSS de `.vault-sidebar .nav-link` em globals.css — esses são escopados.

### Pitfall 5: PsiVault vs PsiLock no CLAUDE.md

**O que dá errado:** Definir a distinção de nomes de forma incompleta, sem exemplos de onde cada nome se aplica.

**Como evitar:** Na seção do CLAUDE.md, listar contextos explicitamente:
- PsiVault: UI labels, copy, landing, mensagens ao usuário, nome do produto em comunicação
- PsiLock: nome do repo, variáveis de ambiente, paths de código, documentação técnica interna

---

## Code Examples

### Tokens a modificar em globals.css

```css
/* ANTES (linha 51-52) */
--space-section-gap:    1.5rem;
--space-row-height:     3.5rem; /* 56px mínimo */

/* DEPOIS */
--space-section-gap:    2rem;
--space-row-height:     4rem;   /* 64px mínimo */
```

```css
/* ANTES (linha 127) */
body {
  line-height: 1.5;
}

/* DEPOIS */
body {
  line-height: 1.6;
}
```

### Refinamento tipográfico na sidebar (globals.css)

```css
/* ANTES */
.vault-sidebar .nav-link {
  color: rgba(255, 255, 255, 0.75);
  transition: background-color 150ms ease, color 150ms ease;
}

/* DEPOIS — adicionar line-height e letter-spacing editorial */
.vault-sidebar .nav-link {
  color: rgba(255, 255, 255, 0.75);
  transition: background-color 150ms ease, color 150ms ease;
  line-height: 1.4;
  letter-spacing: 0.005em;
}
```

### Ajuste de espaçamento no navStyle (vault-sidebar-nav.tsx)

```typescript
const navStyle: React.CSSProperties = {
  flex: 1,
  padding: "0.75rem 0.875rem",   // era "0.5rem 0.75rem"
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",               // era "0.25rem"
};
```

### Ajuste do brand block (layout.tsx)

```typescript
const brandStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "1.5rem 1.25rem 1rem",   // era "1.25rem 1rem 1rem"
} satisfies React.CSSProperties;
```

### Estrutura da seção "Posicionamento Psicanalítico" no CLAUDE.md

```markdown
## Posicionamento Psicanalítico

### Nome de produto
- **PsiVault** — nome do produto em UI, copy, landing e comunicação com o usuário
- **PsiLock** — nome técnico do repositório (código, variáveis de ambiente, paths, docs internas de dev)
- Nunca usar PsiLock em copy voltado ao usuário. Nunca usar PsiVault em nomes de variáveis ou paths.

### Vocabulário obrigatório
| Use | Não use |
|-----|---------|
| paciente | cliente, usuário |
| atendimento | serviço, sessão genérica |
| prontuário | ficha, registro |
| acompanhamento | tratamento, programa |
| escuta | suporte, ajuda |

Termos psicanalíticos (usar com precisão, sem banalizar):
- `transferência`, `inconsciente`, `sintoma` — apenas em contexto clínico correto
- Não usar como metáfora de produto ("a transferência de dados", "o inconsciente do sistema")

### Anti-padrões de tom
Frases proibidas (nunca usar, nem variantes):
- "Revolucione sua rotina clínica"
- "Potencialize seus atendimentos"
- "IA que entende você"
- "Transforme sua prática"
- "Ferramenta inteligente para psicólogos"

Tom proibido:
- Linguagem de coach ou wellness brand
- Slogans vazios sem substância operacional
- Hype tecnológico ou AI gimmick
- Jargão burocrático ou jurídico como voz principal

### Regras do Assistente de Pesquisa (plano premium)
O que o assistente faz:
- Resume conceitos psicanalíticos de obras em domínio público
- Indica obras e pensadores para estudo
- Constrói bibliografias anotadas por linha teórica
- Compara conceitos entre diferentes escolas (Freud, Lacan, Winnicott, Klein, Bion)

O que o assistente não faz:
- Não reproduz textos protegidos por copyright
- Não faz diagnóstico clínico nem sugere condutas terapêuticas
- Não simula analista nem substitui supervisão
- Não gera conclusões clínicas sobre casos reais

### Limites de copyright
- Resumos, paráfrases e conceitos: permitidos
- Citações curtas (até 3-4 frases) com atribuição: permitidas
- Capítulos, seções extensas ou obras completas: proibido reproduzir
- Obras em domínio público (ex: Freud em português/alemão): texto integral permitido se licença verificada
- Regra geral: indicar a obra, não substituí-la

### Anti-padrões visuais (app interno)
- Sem gradientes decorativos em superfícies funcionais (sidebar, cards, formulários)
- Sombras contidas: usar apenas `--shadow-sm` e `--shadow-md` — nunca sombras exageradas para "efeito"
- Animações só quando melhoram orientação ou resposta de interação — nunca decorativas
- Sem badges, chips coloridos ou indicadores de "novidade" sem função real
- Hierarquia via tipografia e espaçamento — não via cor excessiva
```

---

## State of the Art

| Aspecto | Estado atual | Estado após fase 21 |
|---------|-------------|---------------------|
| Documentação de marca | Apenas "Direção de Marca — Landing PsiVault" em CLAUDE.md | + seção "Posicionamento Psicanalítico" cobrindo vocabulário, anti-padrões, plano premium, copyright |
| Tokens de espaçamento | `--space-section-gap: 1.5rem`, `--space-row-height: 3.5rem` | `2rem` e `4rem` respectivamente |
| line-height | `1.5` no body | `1.6` |
| Sidebar espaçamento | `padding: "0.5rem 0.75rem"`, `gap: "0.25rem"` | Mais respiro nos valores inline |
| Distinção PsiVault/PsiLock | Implícita | Explícita e documentada em CLAUDE.md |

---

## Open Questions

1. **line-height para títulos (`h1`, `h2`)**
   - O CONTEXT.md menciona "refinar line-height para texto corrido e títulos"
   - O que sabemos: body vai de 1.5 para 1.6; não há tokens de line-height para headings atualmente
   - O que está incerto: se a fase deve apenas mudar o body ou também adicionar tokens `--line-height-heading`
   - Recomendação: focar no body (impacto imediato) e não criar novos tokens não pedidos — seguir "não adicionar features além do pedido"

2. **Tokens de font-weight nomeados**
   - O CONTEXT.md menciona "mais uso de 500/600", não a criação de novos tokens
   - Recomendação: aplicar os pesos diretamente via valor literal onde a hierarquia precisa ser reforçada na sidebar — não criar tokens novos se não houver demanda explícita

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRAND-01 | CLAUDE.md contém seção "Posicionamento Psicanalítico" com vocabulário, anti-padrões, regras premium e copyright | manual-only | N/A — verificação de conteúdo de arquivo de documentação | ✅ (CLAUDE.md existe) |
| BRAND-02 | globals.css tem tokens atualizados; sidebar renderiza com espaçamento e tipografia refinados | manual-only | N/A — verificação visual de CSS e inspeção de arquivo | ✅ (globals.css e sidebar existem) |

**Justificativa para manual-only:** Ambos os requisitos são de documentação e CSS — não há lógica de negócio testável via Vitest (framework configurado para node env sem browser). Verificação é inspeção de arquivo (BRAND-01) e inspeção visual no browser (BRAND-02).

### Sampling Rate

- **Por tarefa:** Verificar arquivo modificado diretamente (Read + inspeção visual)
- **Gate da fase:** `pnpm test` verde (sem regressões introduzidas pelas edições de CSS/docs)

### Wave 0 Gaps

Nenhum — a infraestrutura de testes existente cobre a regressão. Esta fase não introduz lógica testável nova.

---

## Sources

### Primary (HIGH confidence)

- Leitura direta de `src/app/globals.css` — estado atual completo dos tokens
- Leitura direta de `src/app/(vault)/components/vault-sidebar-nav.tsx` — estilos inline atuais
- Leitura direta de `src/app/(vault)/layout.tsx` — estrutura e estilos do sidebar container
- Leitura direta de `CLAUDE.md` — seções existentes de marca
- `.planning/phases/21-brand-foundation/21-CONTEXT.md` — decisões bloqueadas

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — definição formal de BRAND-01 e BRAND-02
- `.planning/STATE.md` — decisões acumuladas do projeto

---

## Metadata

**Confidence breakdown:**
- Escopo das edições: HIGH — todos os arquivos lidos, deltas identificados com precisão
- Conteúdo da seção CLAUDE.md: HIGH — CONTEXT.md especifica o conteúdo necessário com granularidade suficiente
- Impacto de `--space-section-gap` global: MEDIUM — token usado em múltiplos lugares; mudança é intencional mas pode ter efeito visual além da sidebar

**Research date:** 2026-03-28
**Valid until:** Estável — não há dependências de biblioteca; válido até mudança de decisões de design
