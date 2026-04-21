# Feature Landscape

**Domain:** Prontuário Eletrônico para Psicólogos (Módulo Financeiro)
**Researched:** 2026-04-21

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Lançamento de Despesas | O controle financeiro real exige entradas (sessões) e saídas (custos). | Low | CRUD simples com data, valor, descrição e categoria (ex: aluguel, CRP, supervisão, impostos). |
| Emissão de Recibo em PDF | Exigência legal e contábil. Pacientes precisam para abatimento no IRPF. | Med | Precisa cruzar dados do psicólogo (Nome, CPF, CRP), paciente (Nome, CPF) e atendimentos (datas, valores). |
| Dashboard Financeiro Claro | Psicólogos não são contadores; precisam bater o olho e entender se estão no azul ou no vermelho. | Med | Refatoração da UX/UI atual para usar cards resumidos (recebido, a receber, despesas, saldo). |
| Controle de Inadimplência | É a maior dor financeira da clínica. O sistema precisa destacar quem deve. | Low | UI focada (ex: badge vermelho, lista separada) para pagamentos atrasados, substituindo formulários inline complexos. |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| DRE Simples (Lucro/Prejuízo) | Traz uma visão empresarial da prática clínica, mostrando a margem de lucro real. | Med | Requer consolidação de receitas e despesas estruturadas por mês e categoria. |
| Envio de Recibo por Email/WhatsApp | Reduz atrito na comunicação e o trabalho manual de baixar e enviar o arquivo. | High | Depende de infraestrutura de email ou API externa (fora do escopo imediato, mas bom diferencial futuro). |
| Exportação para o Contador | Facilita a vida do profissional na época de declaração de imposto de renda (Carnê-Leão). | Low | Geração de arquivo CSV/Excel ou relatório formatado para impressão com o fluxo de caixa consolidado. |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Emissão de Nota Fiscal (NFS-e) | Cada prefeitura no Brasil tem uma API diferente. O custo de manutenção e suporte é altíssimo. | Focar apenas em Recibos em PDF, que já atendem à grande maioria dos psicólogos que atuam como Pessoa Física. |
| Integração Bancária (Open Finance) | Risco de segurança, compliance alto e complexidade de infraestrutura. Foge do core clínico. | Manter lançamentos manuais com uma interface (UX/UI) extremamente rápida e sem atrito via modais/drawers. |
| Rateio Complexo / Centro de Custos | A maioria dos usuários são profissionais autônomos ou clínicas pequenas. Complexidade desnecessária. | Usar um sistema de categorias plano (flat) e simples para as despesas. |

## Feature Dependencies

```
Gestão Básica (Receitas atuais) → Refatoração UX/UI Finanças (Base visual)
Refatoração UX/UI Finanças → Módulo de Despesas (Usa os novos modais/drawers)
Perfil do Psicólogo (Configurações) + Pacientes + Receitas → Emissão de Recibos PDF
Módulo de Despesas + Receitas → Relatórios Consolidados (DRE simples e Fluxo de Caixa)
```

## MVP Recommendation

Prioritize:
1. **Refatoração UX/UI Finanças:** Layout mais limpo, usando modais/drawers em vez de formulários inline, com visão clara de inadimplência.
2. **Módulo de Despesas:** CRUD básico (criar, ler, atualizar, deletar) com categorias pré-definidas ou customizáveis.
3. **Emissão de Recibos PDF:** Geração client-side ou server-side simples para download direto (sem envio por email no MVP).
4. **Relatórios Consolidados:** Visão mensal em tela comparando receitas vs despesas (DRE simples).

Defer:
- Envio automático de recibos por email/WhatsApp.
- Emissão de Notas Fiscais Eletrônicas.
- Exportações complexas (OFX).

## Sources

- Padrões de mercado em HealthTechs e softwares de gestão de consultório (PsicoManager, Zenklub).
- Requisitos do Conselho Regional de Psicologia (CRP) para emissão de documentos financeiros.
- Diretrizes da Receita Federal para comprovação de despesas médicas (Carnê-Leão).