---
status: partial
phase: 33-micro-interacoes-em-componentes-base
source: [33-VERIFICATION.md]
started: 2026-04-24T08:35:00Z
updated: 2026-04-24T08:35:00Z
---

## Current Test

awaiting human testing

## Tests

### 1. Navegação por teclado: focus rings visíveis e elegantes
expected: Ao navegar por Tab, todos os botões, links, inputs, nav items da sidebar e tabs exibem focus ring com box-shadow suave. O ring na sidebar (fundo escuro) deve ser claramente visível com tom quente (rgba(253, 186, 116, 0.5)).
result: pending

### 2. Floating labels: animação suave e alinhamento correto
expected: Em todos os formulários de auth (sign-in, sign-up, reset, complete-profile) e vault (expense-filters, side-panel, category-modal, reminders, search), ao focar um input ou preenchê-lo, a label flutua para cima com transição suave (≤200ms) e fica alinhada visualmente.
result: pending

### 3. Error shake: sutileza do movimento lateral
expected: Ao submeter um formulário auth com erro de campo (ex: e-mail inválido) ou o expense-side-panel com erro geral, o input afetado deve tremer sutilmente (2px lateral, 200ms, 1 iteração) sem parecer agressivo ou punitivo.
result: pending

### 4. prefers-reduced-motion: todas as animações desabilitadas
expected: Ao habilitar 'reduzir movimento' no sistema operacional, todas as micro-interações (focus rings, card hover, nav transitions, floating labels, error shake, smooth scroll) devem degradar para instantâneo/estático sem quebrar a usabilidade.
result: pending

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
