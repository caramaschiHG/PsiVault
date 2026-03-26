# Pitfalls Research — v2.0 Reposicionamento Psicanalítico

## Question
Quais são as principais armadilhas ao reposicionar um produto para nicho psicanalítico + adicionar assistente AI de pesquisa literária no Brasil?

## Findings

### Armadilha 1: Nicho insuficiente — "psicanalítico" de enfeite
**Risco:** Usar o vocabulário psicanalítico na landing mas manter a UX genérica por dentro. O profissional percebe imediatamente.
**Prevenção:** Reescrever copy em TODOS os módulos internos — empty states, labels, títulos, mensagens de erro. Não só a landing.
**Fase:** Fase 22 (copy interna)

### Armadilha 2: Nicho excessivo — alienar psicólogos de outras orientações
**Risco:** Copy tão específico para psicanálise que profissionais de outras abordagens se sentem excluídos antes de testar.
**Prevenção:** Focar no posicionamento como "plataforma de orientação psicanalítica" sem dizer "você precisa ser lacaniano". O produto funciona para qualquer psicólogo, mas se posiciona para quem valoriza registro, continuidade e seriedade clínica.
**Fase:** Fase 21 (landing)

### Armadilha 3: AI assistant drift para clínica
**Risco:** Usuário pede "o que você acha do meu paciente X?" e o assistente responde. Viola posicionamento e gera responsabilidade.
**Prevenção:** System prompt forte com boundaries explícitos. Interface que deixa claro: "Assistente de Pesquisa em Literatura Psicanalítica — não participa de casos clínicos."
**Fase:** Fase 24 (assistente premium)

### Armadilha 4: Copyright na distribuição de literatura
**Risco:** Assistente AI distribui trechos longos ou textos completos de obras protegidas (Lacan, Klein, Winnicott).
**Prevenção:**
- Implementar categorização de obras: domínio público / licenciado / protegido
- Para obras protegidas: máximo de trecho curto (~200 palavras) + citação precisa + guia de acesso legal
- Freud: obras completas em domínio público (maioria) — acesso integral permitido
- Lacan, Klein, Winnicott e contemporâneos: normalmente protegidos — apenas metadados + trechos
**Fase:** Fase 24 (assistente premium)

### Armadilha 5: Tom errado na landing
**Risco:** Landing cai em um dos anti-padrões: muito startup ("revolucione"), muito técnica ("100% uptime"), muito wellness ("cuide de você").
**Prevenção:** Revisão de copy contra checklist de anti-padrões antes de publicar. Tom-test: "Um psicanalista leria isso e se reconheceria?"
**Fase:** Fase 21 (landing)

### Armadilha 6: Promessas legais/regulatórias
**Risco:** Frases como "em conformidade com CFP" ou "LGPD garantida" sem evidência específica no produto.
**Prevenção:** Usar linguagem de responsabilidade operacional: "registros organizados e seguros", "backup automático", "acesso apenas seu". Nunca certificação sem base.
**Fase:** Fase 21 (landing), Fase 22 (copy interna)

### Armadilha 7: Pricing desconectado da realidade brasileira
**Risco:** Plano premium com preço de SaaS americano para profissional autônomo brasileiro.
**Prevenção:** Pricing em BRL, alinhado com realidade de consultório privado autônomo (~R$5k-15k/mês de receita). Pesquisar benchmark de outros SaaS profissionais brasileiros (Prontmed, Namu Pro, etc.).
**Fase:** Fase 23 (pricing)

### Armadilha 8: Identidade visual genérica
**Risco:** Landing bonita mas que poderia ser qualquer SaaS de saúde — sem personalidade específica.
**Prevenção:** Evitar: mockups flutuantes, ilustrações de silhuetas, gradientes de saúde mental, paletas de "azul clínico". Preferir: tipografia editorial forte, off-white, charcoal, muito espaço em branco.
**Fase:** Fase 21 (landing), Fase 22 (vault visual)

## Conclusion
O v2.0 tem dois riscos principais: (1) ser psicanalítico só na landing mas genérico por dentro, e (2) o assistente AI derivar para responsabilidades clínicas ou legais que o produto não pode assumir. Ambos são preveníveis com disciplina de copy e boundaries técnicos bem implementados.
