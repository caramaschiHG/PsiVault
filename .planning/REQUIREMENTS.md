# Requirements: PsiVault

**Defined:** 2026-03-15 (v1.0) | Updated: 2026-03-26 (v2.0)
**Core Value (v2.0):** PsiVault é o cofre digital da prática psicanalítica — um ambiente seguro, elegante e estruturado para o clínico que leva a sério o registro, a continuidade e a preservação do trabalho analítico.

---

## v2.0 Requirements — Reposicionamento Psicanalítico

### Brand — Identidade e Marca

- [x] **BRAND-01**: O CLAUDE.md do projeto contém o posicionamento psicanalítico, vocabulário obrigatório, anti-padrões de tom e as regras explícitas do plano premium (o que o AI faz / não faz, limites de copyright)
- [x] **BRAND-02**: A direção visual está documentada em tokens/globals.css — paleta off-white/charcoal/sage, tipografia editorial forte, espaçamento generoso — e aplicada consistentemente

### Land — Landing Page

- [x] **LAND-01**: A landing page tem hero com posicionamento explícito para psicólogos de orientação psicanalítica, CTA para cadastro, copy inteiramente em pt-BR com vocabulário de nicho (prontuário, escuta, continuidade, sigilo)
- [x] **LAND-02**: A landing page tem seção de módulos apresentando Pacientes, Agenda, Prontuário, Documentos e Financeiro com framing específico para prática psicanalítica
- [ ] **LAND-03**: A landing page tem seção de trust e preservação comunicando sigilo, continuidade e preservação de longo prazo em linguagem de responsabilidade operacional — sem promessas legais vagas
- [ ] **LAND-04**: A landing page tem FAQ direcionado às dúvidas reais do psicólogo de orientação psicanalítica em consultório privado

### Nav — Navegação e Copy Interna

- [x] **NAV-01**: Sidebar e todos os itens de navegação em pt-BR com vocabulário psicanalítico (Prontuário, Agenda, Pacientes, Documentos, Financeiro)
- [x] **NAV-02**: Dashboard e visão geral com labels e framing de prática clínica — sem linguagem SaaS genérica ou métricas de "engajamento"
- [x] **NAV-03**: Onboarding usa tom de marca — calmo, profissional, específico para clínicos psicanalíticos — sem jargão genérico ou hype

### Cont — Continuidade e Fluxo de Documentos

- [x] **CONT-01**: Prontuário com navegação cronológica fluida — histórico de sessões visível, ordenado e navegável sem perda de contexto temporal
- [x] **CONT-02**: Fluxo sessão → registro → documento gerado é suave e intuitivo: o usuário nunca perde o fio condutor entre sessão, registro clínico e documento produzido
- [x] **CONT-03**: Hierarquia paciente → sessões → registros → documentos é visualmente coerente e orientada em todas as telas relevantes
- [x] **CONT-04**: Empty states, títulos e mensagens usam linguagem de acompanhamento ao longo do tempo — nunca de registros isolados

### Prem — Plano Premium (conceito e UI)

- [ ] **PREM-01**: Página de apresentação do Assistente de Pesquisa Psicanalítica descrevendo o que faz (literatura, referências por pensador, bibliografias) e o que não faz (diagnóstico, casos clínicos, distribuição de textos protegidos)
- [ ] **PREM-02**: Usuário pode configurar pensador de preferência e linha psicanalítica (Freud, Lacan, Winnicott, Klein, Bion, etc.) nas configurações de perfil
- [ ] **PREM-03**: Copy do plano premium sem linguagem de AI gimmick, sem promessas de diagnóstico, sem implicação de acesso irrestrito a obras protegidas por copyright

---

## v1.x Requirements (previously defined)

### Validated

- ✓ Solo Brazilian psychologist can manage patients, sessions, clinical records, key documents, and simple payment tracking in one responsive web app — v1.0
- ✓ Product supports real rhythm of Brazilian private practice — recurring appointments, rescheduling, WhatsApp-adjacent workflows, Pix-oriented payment tracking, hybrid online/presential care — v1.0
- ✓ Sensitive health data treated like a vault — strong access protection, auditability, backup/export paths — v1.0

### Active (v1.2 — in parallel milestone)

- [ ] Complete Supabase persistence for all remaining domains (Clinical, Document, Finance, Ops, Audit)
- [ ] Professional authentication UX — real login, signup, and password reset flows
- [ ] Full UI/UX polish — design system, typography, color, responsive layout, accessibility
- [ ] Production best practices — error handling, security hardening, code quality, performance

---

## v3.0 Requirements (deferred)

### Premium AI — Integração funcional

- **AI-01**: Integração real com Claude API para o assistente de pesquisa psicanalítica
- **AI-02**: Busca e citação de obras em domínio público (Freud completo) com precisão
- **AI-03**: Construção de listas de leitura e bibliografias anotadas por linha teórica
- **AI-04**: Comparação de conceitos entre diferentes pensadores/escolas

### Pricing

- **PRICE-01**: Página de planos com tabela livre/premium em BRL
- **PRICE-02**: Integração com gateway de pagamento para plano premium

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI diagnóstico ou apoio a decisão clínica | Fora do escopo de todos os planos — responsabilidade legal e posicionamento de produto |
| Distribuição de obras protegidas por copyright | Risco legal — apenas domínio público, licenciado, ou enviado pelo usuário |
| Plataforma genérica para todos os psicólogos | Anti-goal de posicionamento — nicho psicanalítico é intencional |
| Chat/messaging interno | Excluído desde v1.0 — produto não é uma inbox |
| Multi-usuário / clínica | Excluído desde v1.0 — foco no profissional autônomo |
| Integração funcional do AI no v2.0 | Deferida para v3.0 — v2.0 é conceito e UI |
| Pricing/planos no v2.0 | Deferido para v3.0 — v2.0 foca em identidade e experiência |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 21 | Complete |
| BRAND-02 | Phase 21 | Complete |
| LAND-01 | Phase 22 | Complete |
| LAND-02 | Phase 22 | Complete |
| LAND-03 | Phase 22 | Pending |
| LAND-04 | Phase 22 | Pending |
| NAV-01 | Phase 23 | Complete |
| NAV-02 | Phase 23 | Complete |
| NAV-03 | Phase 23 | Complete |
| CONT-01 | Phase 24 | Complete |
| CONT-02 | Phase 24 | Complete |
| CONT-03 | Phase 24 | Complete |
| CONT-04 | Phase 24 | Complete |
| PREM-01 | Phase 25 | Pending |
| PREM-02 | Phase 25 | Pending |
| PREM-03 | Phase 25 | Pending |

**Coverage:**
- v2.0 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-26 after v2.0 milestone definition*
