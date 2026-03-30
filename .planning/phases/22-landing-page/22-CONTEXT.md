# Phase 22: Landing Page - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Reescrever o copy da landing page existente com posicionamento psicanalítico — hero, dores, features, trust/sigilo e FAQ. A estrutura de seções atual é mantida; apenas textos, ordem de features e mockup do hero mudam. Planos/pricing e integrações externas pertencem a outras fases.

</domain>

<decisions>
## Implementation Decisions

### Escopo do redesign
- Manter estrutura de seções existente (hero → trust bar → dores → features → security → FAQ → CTA)
- Reescrever apenas o copy — sem novas seções, sem reestruturação de layout
- Trocar o mockup do hero: de "Agenda de hoje" para tela de prontuário com evoluções do paciente
- Reescrever a seção de dores com problemas específicos do psicólogo psicanalítico (registros de evolução, continuidade do caso, documentação ética, sigilo no digital)

### Identidade no hero
- Eyebrow: explícito — "Para psicólogos de orientação psicanalítica" (sem ambiguidade)
- H1: vocabulário de nicho direto — mencionar acompanhamento, continuidade, escuta ou prontuário
- Bullets do hero: reescrever com linguagem do psicanalista (ex: "Registros de evolução, acompanhamento e documentos no mesmo contexto")
- Seção de features: reordenar para Prontuário em primeiro lugar (Prontuário → Pacientes → Agenda → Documentos → Financeiro)

### Trust e sigilo
- Tom: fatos operacionais do sistema, não promessa vaga
- Trust points: reescrever com 4 temas — sigilo (só você acessa), acesso (autenticado, sem compartilhamento), continuidade (histórico preservado), exportação (seus dados, sempre)
- Linguagem da seção de segurança: cuidado com a prática clínica, austero, sem hype

### FAQ
- Foco: dúvidas-objeção do psicólogo autônomo antes de assinar (não FAQ de suporte funcional)
- Temas: dados e propriedade, acesso offline, exportação, cancelamento, conformidade ética (CFP)
- Volume: 5–7 perguntas

### Claude's Discretion
- Texto exato do h1 e subtítulo do hero (desde que respeite vocabulário obrigatório do CLAUDE.md)
- Copy dos trust points individuais (desde que cubra os 4 temas: sigilo, acesso, continuidade, exportação)
- Perguntas específicas do FAQ (desde que cubra os temas: dados, acesso offline, exportação, cancelamento, conformidade ética)
- Copy do mockup de prontuário (nomes fictícios, datas, texto de evolução)
- Reescrita dos subtítulos das features (desde que Prontuário seja o primeiro)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `landing-page.tsx` (692 linhas): componente único com toda a landing — editar copy e reordenar features array diretamente
- `landing-page.module.css` (20.9K): estilos completos, sem necessidade de mudança visual para este escopo
- `animate-in.tsx`: componente de animação de entrada já integrado
- Font `Newsreader` (editorial serif): já configurada e aplicada no h1

### Established Patterns
- Features são um array de objetos `{title, copy, icon}` — reordenar é só mudar a ordem no array
- Trust points são array `{title, copy}` — substituir os 4 objetos
- Dores são array `{index, title, copy}` — substituir os 5 objetos
- FAQ é array `{question, answer}` — substituir perguntas e respostas
- Copy inline no JSX (não vem de CMS ou arquivo separado) — editar diretamente no .tsx
- Mockup do hero é HTML/CSS puro dentro do componente — substituir a estrutura interna do `workspaceMain`

### Integration Points
- `src/app/page.tsx` renderiza `<LandingPage />` diretamente — nenhuma mudança de roteamento necessária
- CTAs apontam para `/sign-in` e `/sign-up` — manter
- Links de navegação (`#recursos`, `#seguranca`, `#faq`) — IDs já existem nas seções correspondentes, manter

</code_context>

<specifics>
## Specific Ideas

- Mockup do hero deve mostrar uma tela de prontuário com evoluções — registros de atendimento com data e texto clínico (fictício), transmitindo continuidade clínica
- O prontuário é o core da prática psicanalítica — sua posição de destaque nas features é sinal de produto que "entende a prática"
- FAQ deve soar como respostas diretas de quem construiu o produto com cuidado — não suporte automático

</specifics>

<deferred>
## Deferred Ideas

- Paleta visual charcoal/sage para a landing — decidido não escopo desta fase (paleta é decisão visual separada)
- Seção de pricing/planos — Fase 25
- Integrações externas (Google Calendar, WhatsApp) — fora do escopo v2.0

</deferred>

---

*Phase: 22-landing-page*
*Context gathered: 2026-03-30*
