---
phase: 22-landing-page
plan: 02
status: complete
completed_at: "2026-04-01"
requirements_addressed:
  - LAND-03
  - LAND-04
---

# Plan 22-02 Summary — Trust, FAQ e Seções Secundárias

## What Was Done

Reescrita completa de `trustPoints`, `pains`, `securityPoints`, `faqs` e `brazilRows` em `landing-page.tsx`, com posicionamento psicanalítico e fatos operacionais sem promessas legais vagas.

## Changes Made

**`src/app/components/landing/landing-page.tsx`**

- `trustPoints` (4 itens): sigilo, acesso autenticado, histórico preservado, portabilidade total — somente fatos operacionais, zero menção a CFP/LGPD/certificações
- `pains` (5 itens): dores específicas do psicólogo psicanalítico — registros espalhados, continuidade comprometida, documentação fora da rotina, dados sensíveis em ferramentas genéricas, histórico fragmentado
- `securityPoints` (5 itens): linguagem austera de cuidado operacional — sessões visíveis, confirmação explícita, backup, exportação, acesso exclusivo
- `faqs` (7 itens): perguntas de pré-compra cobrindo dados/propriedade, offline, exportação, cancelamento, conformidade ética, compartilhamento, online/presencial
- `brazilRows` (5 itens): vocabulário, documentos, prática clínica, independência, financeiro — reframing de "consultório brasileiro genérico" para prática analítica

## Decisions

- FAQ responde objeções de pré-compra, não suporte pós-assinatura
- Conformidade ética abordada por fatos do sistema (acesso exclusivo, exportação, histórico) sem prometer adequação ao CFP
- securityPoints mantém tom sereno e operacional, distante de hype de segurança

## Verification

- `pnpm tsc --noEmit`: ✓ sem erros
- `pnpm test`: ✓ 320 testes passando (25 arquivos)
- `pnpm build`: ✓ build green
- Anti-padrões (CFP, LGPD, conformidade, revolucione, potencialize): grep retorna 0
- Vocabulário: paciente, atendimento, prontuário, acompanhamento — presente em todas as seções
