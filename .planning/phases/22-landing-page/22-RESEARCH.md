# Phase 22: Landing Page - Research

**Researched:** 2026-03-30
**Domain:** Copy rewrite — landing page existente, posicionamento psicanalítico
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Escopo do redesign**
- Manter estrutura de seções existente (hero → trust bar → dores → features → security → FAQ → CTA)
- Reescrever apenas o copy — sem novas seções, sem reestruturação de layout
- Trocar o mockup do hero: de "Agenda de hoje" para tela de prontuário com evoluções do paciente
- Reescrever a seção de dores com problemas específicos do psicólogo psicanalítico (registros de evolução, continuidade do caso, documentação ética, sigilo no digital)

**Identidade no hero**
- Eyebrow: explícito — "Para psicólogos de orientação psicanalítica" (sem ambiguidade)
- H1: vocabulário de nicho direto — mencionar acompanhamento, continuidade, escuta ou prontuário
- Bullets do hero: reescrever com linguagem do psicanalista (ex: "Registros de evolução, acompanhamento e documentos no mesmo contexto")
- Seção de features: reordenar para Prontuário em primeiro lugar (Prontuário → Pacientes → Agenda → Documentos → Financeiro)

**Trust e sigilo**
- Tom: fatos operacionais do sistema, não promessa vaga
- Trust points: reescrever com 4 temas — sigilo (só você acessa), acesso (autenticado, sem compartilhamento), continuidade (histórico preservado), exportação (seus dados, sempre)
- Linguagem da seção de segurança: cuidado com a prática clínica, austero, sem hype

**FAQ**
- Foco: dúvidas-objeção do psicólogo autônomo antes de assinar (não FAQ de suporte funcional)
- Temas: dados e propriedade, acesso offline, exportação, cancelamento, conformidade ética (CFP)
- Volume: 5–7 perguntas

### Claude's Discretion
- Texto exato do h1 e subtítulo do hero (desde que respeite vocabulário obrigatório do CLAUDE.md)
- Copy dos trust points individuais (desde que cubra os 4 temas: sigilo, acesso, continuidade, exportação)
- Perguntas específicas do FAQ (desde que cubra os temas: dados, acesso offline, exportação, cancelamento, conformidade ética)
- Copy do mockup de prontuário (nomes fictícios, datas, texto de evolução)
- Reescrita dos subtítulos das features (desde que Prontuário seja o primeiro)

### Deferred Ideas (OUT OF SCOPE)
- Paleta visual charcoal/sage para a landing — decidido não escopo desta fase (paleta é decisão visual separada)
- Seção de pricing/planos — Fase 25
- Integrações externas (Google Calendar, WhatsApp) — fora do escopo v2.0
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | Hero com posicionamento explícito para psicólogos de orientação psicanalítica, CTA para cadastro, copy em pt-BR com vocabulário de nicho (prontuário, escuta, continuidade, sigilo) | Eyebrow + H1 já mapeados; vocabulário obrigatório documentado no CLAUDE.md; CTAs existentes (`/sign-up`) permanecem |
| LAND-02 | Seção de módulos com Pacientes, Agenda, Prontuário, Documentos e Financeiro, framing de prática psicanalítica | Array `features` identificado; reordenação é troca de posição no array; copy de cada módulo a reescrever |
| LAND-03 | Seção de trust com sigilo, continuidade e preservação em linguagem operacional, sem promessas legais vagas | Array `trustPoints` (4 objetos) identificado; `securityPoints` (lista) identificado; tom e 4 temas definidos |
| LAND-04 | FAQ direcionado às dúvidas reais do psicólogo de orientação psicanalítica em consultório privado | Array `faqs` identificado; 5–7 perguntas; temas obrigatórios: dados, acesso offline, exportação, cancelamento, conformidade CFP |
</phase_requirements>

---

## Summary

Esta fase é uma reescrita de copy cirúrgica sobre uma landing page já construída e funcional (`landing-page.tsx`, 692 linhas). Não há nova engenharia: toda a estrutura de componente, CSS, animações e roteamento permanece intacta. O planner precisa apenas criar tarefas de edição de texto sobre superfícies já mapeadas.

A landing atual usa posicionamento genérico ("Para psicólogos no Brasil", "rotina clínica organizada"). A reescrita move para posicionamento de nicho explícito ("Para psicólogos de orientação psicanalítica") com vocabulário que sinaliza domínio: prontuário, evolução clínica, continuidade do caso, escuta, acompanhamento, sigilo.

O risco principal não é técnico — é de tom. O vocabulário psicanalítico deve soar como escolha de produto, não como performance de nicho. As regras do CLAUDE.md (anti-padrões de tom, vocabulário obrigatório, regras visuais) são o guia de referência de ground truth.

**Primary recommendation:** Editar `landing-page.tsx` diretamente, substituindo os arrays de dados e o JSX do mockup do hero; nenhum outro arquivo precisa mudar.

---

## Standard Stack

### Core

| Componente | Localização | Natureza | Observação |
|------------|-------------|----------|------------|
| `landing-page.tsx` | `src/app/components/landing/landing-page.tsx` | Componente único (692 linhas) | Todo o copy da landing vive aqui — arrays de dados e JSX inline |
| `landing-page.module.css` | `src/app/components/landing/landing-page.module.css` | CSS Modules (20.9K) | Sem mudança nesta fase |
| `animate-in.tsx` | `src/app/components/landing/animate-in.tsx` | Componente de animação | Já integrado, sem mudança |
| Fonte `Newsreader` | `next/font/google` | Serif editorial | Já aplicada no H1 e `SectionHeading.title` |
| `src/app/page.tsx` | raiz do App Router | Entry point | Renderiza `<LandingPage />` diretamente — sem mudança |

### Superfícies de dados (arrays inline no componente)

| Array | Tipo dos itens | Quantidade atual | O que muda |
|-------|---------------|-----------------|------------|
| `trustPoints` | `{title, copy}` | 4 | Substituir todos os 4 objetos |
| `pains` | `{index, title, copy}` | 5 | Substituir todos os 5 objetos |
| `features` | `{title, copy, icon}` | 6 | Reordenar + reescrever title/copy; ícones SVG permanecem |
| `securityPoints` | `string[]` | 5 | Substituir todos os 5 strings |
| `brazilRows` | `{label, value}` | 5 | Substituir copy de `value`; avaliar se seção permanece relevante |
| `faqs` | `{question, answer}` | 5 | Substituir todas as 5 perguntas e respostas (meta: 5–7) |

### JSX inline que muda (não são arrays)

| Trecho | Localização (linha aprox.) | O que muda |
|--------|---------------------------|-----------|
| Eyebrow do hero | L232 `<p className={styles.eyebrow}>` | "Para psicólogos no Brasil" → "Para psicólogos de orientação psicanalítica" |
| H1 do hero | L233–235 | Reescrever com vocabulário de nicho |
| Lead paragraph do hero | L236–240 | Reescrever |
| Bullets do hero (`heroNotes`) | L251–255 | Reescrever 3 bullets |
| Mockup do hero (`workspaceMain`) | L269–316 | Substituir "Agenda de hoje" por tela de prontuário com evoluções |
| Chrome label do mockup | L266 | "PsiVault — Agenda de hoje" → "PsiVault — Prontuário" ou similar |
| Seção "O que é o PsiVault" (SolutionBoard) | L363–403 | Avaliar se o framing genérico precisa de ajuste fino |
| Seção "Como o uso se encaixa" (WorkflowGrid) | L485–582 | Avaliar alinhamento com novo posicionamento |
| Final CTA section | L609–633 | Copy final deve reforçar nicho psicanalítico |
| Footer copy | L645–648 | Ajustar para vocabulário de nicho |

---

## Architecture Patterns

### Padrão de edição desta fase

**O que:** Edição direta no `.tsx` — trocar strings, reordenar array, substituir JSX do mockup.

**Não criar:** arquivos separados de conteúdo, CMS, i18n files. O CONTEXT.md confirma que copy é inline no JSX.

**Sequência recomendada de tarefas:**
1. Hero copy (eyebrow, H1, lead, bullets) — identidade principal
2. Hero mockup (JSX do `workspaceMain`) — visual de prontuário
3. Trust points array — 4 temas de sigilo/acesso/continuidade/exportação
4. Features array — reordenar + reescrever (Prontuário primeiro)
5. Pains array — dores específicas do psicanalista
6. Security points + seção de segurança — linguagem operacional
7. FAQ array — 5–7 perguntas de dúvida-objeção
8. Seções secundárias (SolutionBoard, WorkflowGrid, final CTA, footer) — ajuste fino de consistência

### Mockup do hero: estrutura esperada

O mockup atual (`workspaceMain`) simula "Agenda de hoje" com lista de horários + card de "Evolução recente". A nova versão deve simular prontuário com evoluções cronológicas:

```
workspaceMain
├── workspaceTopline: "Prontuário — Helena Prado" / data
├── workspacePatientCard: paciente em acompanhamento
└── workspaceGrid:
    ├── Card A: lista de evoluções com data e texto clínico (fictício)
    └── Card B: registro de atendimento recente com trecho de evolução
```

Os nomes dos pacientes são fictícios — seguir convenção já presente no arquivo (nomes brasileiros verossímeis: Helena Prado, Caio Ribeiro).

---

## Don't Hand-Roll

| Problema | Não construir | Usar em vez disso | Por quê |
|----------|--------------|-------------------|---------|
| Novo layout / seções | Nova estrutura de seções | Estrutura existente no `landing-page.tsx` | CONTEXT.md: "manter estrutura de seções existente" |
| Estilo dos novos elementos | Novas classes CSS | Classes existentes no module.css | Escopo é apenas copy |
| Animações | Novo mecanismo de animação | `<AnimateIn>` já integrado | Já em uso em todas as seções |
| Roteamento / CTAs | Novos endpoints | `/sign-up` e `/sign-in` existentes | CONTEXT.md: "manter" |

---

## Common Pitfalls

### Pitfall 1: Tom de performance de nicho
**O que vai errado:** Copy que parece "nós sabemos psicanálise" em vez de produto que conhece a prática.
**Por que acontece:** Usar jargão teórico (inconsciente, transferência, pulsão) como vocabulário de produto.
**Como evitar:** Vocabulário é operacional de prática — prontuário, evolução, continuidade, escuta, acompanhamento. Termos teóricos só aparecem se estritamente contextuais.
**Sinal de alerta:** Qualquer uso de "transferência", "inconsciente", "pulsão" na landing.

### Pitfall 2: Promessa legal vaga na seção de sigilo
**O que vai errado:** "em conformidade com o CFP", "segurança de dados garantida", "100% seguro".
**Por que acontece:** Instinto de tranquilizar o usuário com referências de autoridade.
**Como evitar:** Somente fatos operacionais: "Só você acessa", "histórico preservado", "seus dados exportáveis a qualquer momento".
**Sinal de alerta:** Qualquer menção a CFP, LGPD, ou certificações como argumento de confiança.

### Pitfall 3: FAQ de suporte em vez de FAQ de conversão
**O que vai errado:** Perguntas como "Como faço para criar uma conta?" ou "Como funciona o prontuário?".
**Por que acontece:** FAQ genérico de SaaS transladado.
**Como evitar:** Perguntas são objeções de compra do psicólogo autônomo: "E se eu cancelar, perco meus dados?", "O PsiVault funciona sem internet?", "Meus registros ficam guardados por quanto tempo?".
**Sinal de alerta:** Pergunta que seria feita após assinar, não antes.

### Pitfall 4: Feature order errada
**O que vai errado:** Prontuário não em primeiro no array `features`.
**Por que acontece:** Ordem atual começa em "Pacientes com contexto".
**Como evitar:** O planner deve instruir explicitamente a reordenar o array: Prontuário → Pacientes → Agenda → Documentos → Financeiro. O 6º item atual ("Online e presencial no mesmo fluxo") pode ser absorvido ou permanecer como último.
**Sinal de alerta:** Qualquer plano que reescreve copy de features sem mencionar reordenação.

### Pitfall 5: Mockup do hero com linguagem clínica imprópria
**O que vai errado:** Texto de evolução fictício que soa como diagnóstico ou interpretação clínica.
**Por que acontece:** Tentar parecer "autêntico" com conteúdo clínico denso.
**Como evitar:** Evoluções fictícias devem ser neutras e operacionais: "Sessão focada em retomada do histórico do caso. Próximo passo acordado." — sem interpretações, sem diagnósticos.
**Sinal de alerta:** Qualquer texto de evolução que pareça uma interpretação analítica ou diagnóstico.

### Pitfall 6: Seção "Rotina brasileira" (`brazilRows`) sem ajuste de posicionamento
**O que vai errado:** Manter a seção com framing genérico ("Feito para o consultório no Brasil") após reposicionar para nicho psicanalítico.
**Por que acontece:** A seção está fora dos arrays principais e pode ser esquecida no plano.
**Como evitar:** Incluir no plano uma tarefa de revisão das seções secundárias (SolutionBoard, WorkflowGrid, brazilRows, final CTA, footer).

---

## Code Examples

### Estrutura do array features (padrão atual — a reordenar)
```typescript
// Arquivo: src/app/components/landing/landing-page.tsx
// A ordem atual é: Pacientes, Agenda, Prontuário, Documentos, Financeiro, Online/Presencial
// A nova ordem deve ser: Prontuário, Pacientes, Agenda, Documentos, Financeiro [, Online/Presencial]
const features = [
  {
    title: "...",
    copy: "...",
    icon: (<svg ...>...</svg>),
  },
  // ...
];
```

### Estrutura do trust points (padrão atual — substituir todos)
```typescript
// 4 objetos, um por tema: sigilo | acesso | continuidade | exportação
const trustPoints = [
  { title: "...", copy: "..." },
  { title: "...", copy: "..." },
  { title: "...", copy: "..." },
  { title: "...", copy: "..." },
];
```

### Estrutura do mockup do hero (padrão atual — substituir JSX interno)
```tsx
// Localização: dentro de <div className={styles.workspaceMain}>
// Estrutura atual simula "Agenda de hoje"
// Nova estrutura deve simular tela de prontuário com evoluções
<div className={styles.workspaceChrome}>
  <span className={styles.workspaceChromeLabel}>PsiVault — Prontuário</span>
</div>
<div className={styles.workspaceMain}>
  {/* Substituir todo o conteúdo interno por mockup de prontuário */}
</div>
```

### Classes CSS reutilizáveis para o mockup (já existentes)
```
styles.workspaceTopline      — linha de data/contexto
styles.workspacePatientCard  — card do paciente em acompanhamento
styles.workspacePatientName  — nome do paciente
styles.workspaceKicker       — label acima do nome
styles.workspaceGrid         — grid de 2 colunas
styles.workspaceCard         — card individual
styles.workspaceCardLabel    — label do card
styles.workspaceBodyCopy     — parágrafo de evolução
styles.scheduleList          — lista de horários (reutilizar para lista de evoluções)
```

---

## State of the Art

| Aspecto | Estado atual | Estado após fase 22 |
|---------|-------------|---------------------|
| Eyebrow do hero | "Para psicólogos no Brasil" | "Para psicólogos de orientação psicanalítica" |
| H1 | "Um lugar seguro, discreto e claro para organizar a rotina clínica" | Novo h1 com vocabulário de nicho |
| Mockup do hero | Agenda de hoje (lista de horários) | Prontuário com evoluções cronológicas |
| Trust bar | 4 pontos genéricos de organização | 4 pontos de sigilo/acesso/continuidade/exportação |
| Features | Ordem: Pacientes, Agenda, Prontuário, Documentos, Financeiro | Ordem: Prontuário, Pacientes, Agenda, Documentos, Financeiro |
| Pains | Dores genéricas de organização | Dores específicas do psicólogo psicanalítico |
| FAQ | 5 perguntas de uso geral | 5–7 perguntas de dúvida-objeção antes de assinar |
| Security section | Tom de "organização operacional" | Tom de "sigilo e cuidado com a prática clínica" |

**Nada muda:** CSS, animações, roteamento, CTAs, componentes, fontes, estrutura de seções.

---

## Open Questions

1. **Seção "Rotina brasileira" (`brazilRows`) — manter ou adaptar?**
   - O que sabemos: a seção existe e tem framing de "consultório brasileiro genérico"
   - O que está incerto: se essa seção se encaixa no posicionamento psicanalítico ou se deve ser silenciosamente substituída por outro ângulo
   - Recomendação: incluir no plano como tarefa de ajuste de framing — mudar de "Rotina brasileira" para algo como "Prática clínica no Brasil" com copy específico para psicanalistas

2. **6ª feature "Online e presencial no mesmo fluxo" — manter como 6ª ou remover?**
   - O que sabemos: o CONTEXT.md especifica a ordem das 5 features principais; a 6ª existe mas não está na lista
   - O que está incerto: se deve ser removida ou mantida como feature complementar
   - Recomendação: mantê-la como 6ª — é factual e não contradiz o posicionamento psicanalítico

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
| LAND-01 | Hero contém eyebrow com "psicanalítica" e bullets com vocabulário de nicho | manual-only | N/A — inspeção visual/leitura do componente | ❌ não aplicável |
| LAND-02 | Features array tem Prontuário como primeiro item | manual-only | N/A — inspeção do array no componente | ❌ não aplicável |
| LAND-03 | Trust points cobrem sigilo, acesso, continuidade, exportação | manual-only | N/A — inspeção do array no componente | ❌ não aplicável |
| LAND-04 | FAQ cobre temas: dados, offline, exportação, cancelamento, CFP | manual-only | N/A — inspeção do array no componente | ❌ não aplicável |

**Justificativa manual-only:** Esta fase é exclusivamente reescrita de copy estático inline em JSX. Não há lógica, não há funções, não há transformações de dados. Testes automatizados não agregam valor — a verificação é leitura e inspeção do componente editado.

### Sampling Rate

- **Per task commit:** Leitura visual do componente + verificação de TypeScript (`pnpm build` ou `pnpm tsc --noEmit`)
- **Per wave merge:** `pnpm test` (suite existente não deve regredir)
- **Phase gate:** `pnpm build` green + inspeção visual da landing no browser

### Wave 0 Gaps

Nenhuma infraestrutura de testes precisa ser criada para esta fase. A suite existente cobre domínios de negócio; copy de landing não entra no escopo de testes automatizados.

None — existing test infrastructure covers all phase requirements (manual verification only for copy changes).

---

## Sources

### Primary (HIGH confidence)
- Leitura direta de `src/app/components/landing/landing-page.tsx` — mapeamento completo de todas as superfícies de copy
- `.planning/phases/22-landing-page/22-CONTEXT.md` — decisões travadas e escopo definido
- `CLAUDE.md` do projeto — vocabulário obrigatório, anti-padrões de tom, regras visuais

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — definições LAND-01 a LAND-04 com critérios de sucesso
- `.planning/STATE.md` — decisões acumuladas v2.0, especialmente `[v2.0-01]` e `[Phase 21-brand-foundation]`

---

## Metadata

**Confidence breakdown:**
- Mapeamento de superfícies: HIGH — leitura direta do componente, linhas identificadas
- Vocabulário e tom: HIGH — regras explícitas no CLAUDE.md e CONTEXT.md
- Conteúdo do copy (textos específicos): discretion — definido como "Claude's Discretion" no CONTEXT.md
- Riscos de pitfalls: HIGH — derivados diretamente das regras do CLAUDE.md

**Research date:** 2026-03-30
**Valid until:** 2026-06-30 (copy estático, sem dependências de biblioteca)
