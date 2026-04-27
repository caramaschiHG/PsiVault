# Relatório de Pesquisa: UX para Prontuário Eletrônico de Psicólogos

**Data:** 26/04/2026  
**Foco:** EHR/EMR para saúde mental, psicólogos e terapeutas  
**Fontes:** Nielsen Norman Group, PubMed/PMC, Inspired EHRs, W3C/WCAG, Calm Technology, ONC/HealthIT.gov

---

## 1. O que torna um prontuário eletrônico usável vs. frustrante

### 1.1 A crise de usabilidade em EHRs

A literatura acadêmica documenta uma crise persistente de usabilidade em prontuários eletrônicos. Um estudo multisite publicado no *Cardiovascular Digital Health Journal* (Windle et al., 2021) avaliou 53 clínicos em 8 práticas cardíacas usando a System Usability Scale (SUS). O resultado médio dos EHRs instalados foi **47,1/100** (escala de 0–100), classificado como "pobre" — abaixo até mesmo do limiar mínimo de aceitabilidade (68). Quatro anos depois, a pontuação não havia melhorado (48,1). Para referência, o Google Search tem SUS 93; o Microsoft Excel, 57.

Outra revisão sistemática no *J Prim Care Community Health* (Budd, 2023) confirma: EHRs têm SUS médio de **45,9**, colocando-os no **bottom 9%** de todas as tecnologias avaliadas — nota F de usabilidade.

**Fonte:** Windle JR et al. "Roadmap to a more useful and usable electronic health record." *Cardiovasc Digit Health J*. 2021;2(6):301–311. PMCID: PMC8890352.  
**Fonte:** Budd J. "Burnout Related to Electronic Health Record Use in Primary Care." *J Prim Care Community Health*. 2023;14:21501319231166921. PMCID: PMC10134123.

### 1.2 Padrões de UX que funcionam em EHRs

O estudo de Windle et al. desenvolveu um protótipo de EHR usando design centrado no clínico e obteve **SUS 77,8** — uma melhoria de 30 pontos, passando de "pobre" para "bom". Os princípios-chave identificados foram:

| Princípio | Aplicação para psicólogos |
|-----------|---------------------------|
| **Dados sobre documentos** | Em vez de notas longas, apresentar dados estruturados e persistentes do paciente. Evitar "note bloat" (inchaço de notas). |
| **Conectores baseados em problemas** | Associar dados, diagnósticos e intervenções a cada problema do paciente. Para psicologia: vincular anotações de sessão a queixas/hipóteses clínicas. |
| **Push de dados relevantes** | Empurrar informação contextualizada ao clínico, em vez de forçá-lo a navegar por múltiplas telas. |
| **Metáfora da biblioteca** | O prontuário como uma biblioteca onde o psicólogo pega "livros" (dados) da estante, usa e recoloca — sem precisar copiar tudo para a nota. |
| **Telas grandes, alta resolução** | Maximizar visibilidade de dados sem cliques excessivos. |

**Recomendação para PsiVault:** O prontuário deve organizar informação em torno do **paciente e seus problemas**, não em torno de documentos. Cada entrada clínica (evolução, anamnese) deve ser vinculável a problemas/queixas. Dados devem ser "verificáveis" com um clique, não re-copiados.

**Fonte:** Windle et al., 2021.  
**Fonte:** Inspired EHRs. "Design Principles." http://inspiredehrs.org/designing-for-clinicians/design-principles.php

### 1.3 O custo cognitivo de EHRs mal projetados

Um estudo experimental no *JAMA Network Open* (Mazur et al., 2019) comparou EHR baseline vs. otimizado para gestão de resultados de exames anormais. Usando rastreamento ocular (blink rate) e NASA-TLX, descobriu-se que:

- O EHR baseline impôs **carga cognitiva significativamente maior** (blink rate 16 vs. 24 piscadas/minuto, p=0,01).
- O desempenho clínico no baseline foi **68%** vs. **98%** no EHR otimizado (p<0,001).
- A diferença veio principalmente de **tarefas de acompanhamento** (pacientes que não compareceram): clínicos no baseline duplicavam pedidos em vez de resolver o problema real.

**Insight:** Interfaces que não dão visibilidade clara de "estados" (ex: paciente com sessão faltosa que precisa de reagendamento) forçam o clínico a criar workarounds cognitivamente custosos.

**Fonte:** Mazur LM et al. "Association of the Usability of Electronic Health Records With Cognitive Workload and Performance Levels Among Physicians." *JAMA Netw Open*. 2019;2(4):e191709. PMCID: PMC6450327.

---

## 2. Padrões de UX para anotações clínicas e registros de pacientes

### 2.1 A epidemia de "documentation burden"

A documentação é o maior fator de burnout relacionado a EHR. Dados da literatura:

- Clínicos precisam de **até 2 horas adicionais** de entrada de dados para cada 1 hora de contato direto com paciente (Sinsky et al., 2016).
- **69%** dos médicos de atenção primária acham que tarefas clericais do EHR não exigem um médico treinado (Harris Poll, 2018).
- O comprimento das notas clínicas **dobrou** desde o HITECH Act de 2009 (Kroth et al., 2019).
- **Mais da metade** do conteúdo de notas de residentes é duplicado de notas anteriores via copy-paste (Koopman et al., 2015).

**Para psicólogos:** O risco é ainda maior porque as notas psicoterápicas são narrativas e não podem ser totalmente estruturadas. Um prontuário que force campos excessivos ou templates rígidos aumenta o atrito entre a "escuta" e a "digitação".

**Fonte:** Budd J, 2023.  
**Fonte:** Sinsky CA et al. "Allocation of Physician Time in Ambulatory Practice." *Ann Intern Med*. 2016.  
**Fonte:** Koopman RJ et al. "Viewpoint: prospective documentation of clinical information in the EHR." *J Gen Intern Med*. 2015.

### 2.2 Padrões recomendados para note-taking clínico

Baseado na pesquisa de EHRs e nos princípios do *Inspired EHRs*:

**A. Progressive Disclosure (NNGroup)**  
Mostrar apenas os campos essenciais inicialmente. Opções avançadas ou raramente usadas devem ficar em um nível secundário, acessível sob demanda. Isso reduz a carga cognitiva e erros.

> "Progressive disclosure improves 3 of usability's 5 components: learnability, efficiency of use, and error rate." — Jakob Nielsen

**B. Dados em 3 estados (Windle et al.)**  
- **Coletado:** dado inserido (pela secretária, pelo paciente, por outro profissional).  
- **Clarificado:** traduzido para terminologia clínica adequada.  
- **Verificado:** validado pelo psicólogo responsável com um clique.  

Isso elimina a necessidade de reescrever informação já existente.

**C. Evitar "note bloat"**  
- Separar **visualização** de **documentação**. O psicólogo deve poder ver dados do paciente sem que tudo entre na nota da sessão.
- Usar a **lista de problemas** como âncora. Cada sessão deve poder ser rapidamente associada a 1–3 problemas ativos.
- Evitar templates que gerem "impertinent negatives" (negativos irrelevantes) — campos obrigatórios que não se aplicam ao caso.

**D. Autosave e preservação de input**  
Sempre preservar o que o usuário digitou, mesmo em erros. Permitir edição direta em vez de reinício. Erros devem ser exibidos **próximo ao campo**, com explicação de como corrigir (NNGroup, 2023).

**Fonte:** Nielsen J. "Progressive Disclosure." NNGroup, 2006.  
**Fonte:** Windle et al., 2021.  
**Fonte:** Neusesser T, Sunwall E. "Error-Message Guidelines." NNGroup, 2023.

---

## 3. Dark mode vs. light mode em software clínico (pesquisa acadêmica)

A NNGroup publicou uma revisão da literatura acadêmica sobre dark mode (Budiu, 2020), citando estudos de ergonomia e fatores humanos.

### 3.1 Descobertas principais

| População | Melhor modo | Fundamento |
|-----------|-------------|------------|
| **Visão normal** | **Light mode** | Maior luminosidade = pupila mais contraída = menor aberração esférica, maior profundidade de campo, menos fadiga visual. |
| **Ambiente escuro** | Light mode (ainda) | Dobres et al. (2017): durante a noite, light mode foi significativamente melhor que dark mode para leitura glanceable. |
| **Catarata/mídia ocular turva** | **Dark mode** | Legge et al. (1985): pacientes com catarata tiveram melhor taxa de leitura em dark mode. Menos luz = menos dispersão. |
| **Tamanho de fonte pequeno** | **Light mode** | Piepenbrock et al. (2013): quanto menor a fonte, maior a vantagem do light mode. |
| **Uso prolongado (longo prazo)** | **Inconclusivo** | Aleman et al. (2018): leitura prolongada em light mode foi associada a afinamento da coroide (indicador de miopia). Dark mode pode ter benefícios protetores de longo prazo. |

### 3.2 Implicações para PsiVault

- **Default deve ser light mode** para a população geral de psicólogos (visão normal/corrigida).
- **Oferecer dark mode como opção** é fortemente recomendado por três razões: (1) possíveis efeitos de longo prazo da luz; (2) usuários com catarata ou mídia ocular turva; (3) preferência pessoal.
- A opção deve ser **pervasiva** (aplicada a todas as telas), não apenas em leitura de documentos.
- Se o sistema operacional do usuário estiver em dark mode, o app deve respeitar isso via API.

> "In users with normal vision, light mode leads to better performance most of the time... That being said, we strongly recommend that designers allow users to switch to dark mode if they want to." — Raluca Budiu, NNGroup

**Fonte:** Budiu R. "Dark Mode vs. Light Mode: Which Is Better?" NNGroup, 2020.  
**Fonte:** Piepenbrock C et al. "Positive display polarity is advantageous for both younger and older adults." *Ergonomics*, 2013.  
**Fonte:** Dobres J et al. "Effects of ambient illumination, contrast polarity, and letter size on text legibility." *Applied Ergonomics*, 2017.  
**Fonte:** Aleman A et al. "Reading and Myopia: Contrast Polarity Matters." *Scientific Reports*, 2018.

---

## 4. Acessibilidade (WCAG) para aplicações de saúde

### 4.1 WCAG 2.2 como baseline

O W3C define 4 princípios e 3 níveis de conformidade. Para um produto SaaS voltado a profissionais de saúde no Brasil, o mínimo recomendado é **WCAG 2.1/2.2 nível AA**.

Princípios aplicáveis diretamente a EHRs:
- **Perceptível:** contraste adequado (4,5:1 para texto normal), não depender apenas de cor para transmitir informação, textos redimensionáveis.
- **Operável:** navegação por teclado completa, tempo de resposta suficiente, evitar flashes que possam desencadear crises epilépticas.
- **Compreensível:** linguagem clara, feedback de erros explícito, navegação consistente.
- **Robusto:** compatível com leitores de tela e tecnologias assistivas.

### 4.2 Considerações específicas para healthcare

**A. Daltonismo e codificação por cor**  
- 9% dos homens e 0,5% das mulheres têm algum tipo de daltonismo (Inspired EHRs).
- Nunca usar **apenas cor** para indicar status crítico (ex: "urgente", "incompleto", "ativo"). Sempre parear com ícone, texto ou padrão.
- Converter a interface para escala de cinza é um teste simples: se a diferença desaparecer, os daltonistas também não a verão.

**B. População envelhecida**  
- Psicólogos mais experientes podem ter presbiopia e pupilas menores.
- **Light mode com fontes grandes** é preferível (Piepenbrock et al., 2013).
- Alvos de clique devem ser grandes (mínimo 44×44px em touch, recomendado maior para desktop com mouse).

**C. Carga cognitiva e acessibilidade cognitiva**  
- W3C tem diretrizes específicas de acessibilidade cognitiva (Cognitive Accessibility at W3C).
- Evitar jargão técnico em mensagens de erro. Usar linguagem que o psicólogo reconheça (ex: "paciente" em vez de "cliente", conforme regras do projeto).
- Não exigir memorização de códigos ou IDs numéricos (ex: "pat_123abc" nunca como label primário).

**Fonte:** W3C WAI. "WCAG 2 Overview." https://www.w3.org/WAI/standards-guidelines/wcag/  
**Fonte:** Inspired EHRs. "The Dark Side of Seeing Color."  
**Fonte:** NNGroup. "Error-Message Guidelines." 2023.

---

## 5. "Calm UX" e "slow software" — interfaces para foco e redução de ansiedade

### 5.1 Princípios de Calm Technology (Amber Case)

Amber Case, pesquisadora do MIT Media Lab, formalizou os princípios de *Calm Technology* (tecnologia calma) — especialmente relevantes para ambientes clínicos onde o profissional precisa de concentração profunda:

1. **Tecnologia deve exigir a menor atenção possível** — pode comunicar, mas não precisa "falar".
2. **Tecnologia deve informar e criar calma** — a tarefa primária do usuário não é computar, mas ser humano.
3. **Tecnologia deve usar a periferia** — mover-se facilmente da periferia da atenção para o centro e de volta.
4. **A quantidade certa de tecnologia é o mínimo necessário** para resolver o problema.
5. **Tecnologia deve respeitar normas sociais** — introduzir recursos lentamente; violar normas gera estresse.

### 5.2 Aplicação ao consultório de psicologia

| Princípio Calm | Anti-padrão comum | Padrão recomendado para PsiVault |
|----------------|-------------------|----------------------------------|
| Menor atenção possível | Popups de marketing, badges "novo", notificações de upsell | Notificações apenas para eventos clínicos relevantes (ex: sessão em 15 min). |
| Informar sem tirar do ambiente | Alertas modais interrompendo fluxo de escrita da nota | Status sutis na periferia: barra discreta de "salvamento automático", indicador de paciente aguardando. |
| Mínimo necessário | Dashboards com 15 widgets, métricas irrelevantes | Tela inicial limpa: próximos atendimentos + ações pendentes prioritárias. |
| Respeitar normas sociais | Forçar onboarding intrusivo, tutoriais bloqueantes | Onboarding progressivo; dicas contextuais que aparecem quando o usuário primeiro acessa uma funcionalidade. |

### 5.3 Attention Economy (NNGroup)

A NNGroup enfatiza que atenção é um recurso **escasso e valioso**. Produtos digitais competem por ele. Em um consultório, o psicólogo já divide atenção entre:
- O paciente (presencial ou online)
- Suas próprias anotações mentais
- O software

> "A wealth of information creates a poverty of attention." — Herbert A. Simon

**Regra de ouro para PsiVault:** O software nunca deve competir com o paciente pela atenção do psicólogo. Notificações devem ser **passivas por padrão** e **intrusivas apenas em emergências** (ex: conflito de horário, falha de salvamento).

**Fonte:** Case A. "Principles of Calm Technology." https://calmtech.com/  
**Fonte:** Kane L. "The Attention Economy." NNGroup, 2019.

---

## 6. Micro-interações e padrões de feedback que ajudam (e não distraem)

### 6.1 Hierarquia de comunicação de status (NNGroup, 2024)

Kim Flaherty (NNGroup, 2024) distingue três mecanismos de feedback. Usar o errado aumenta o custo de interação e a frustração:

| Mecanismo | Quando usar | Exemplo em PsiVault |
|-----------|-------------|---------------------|
| **Indicator** | Informação contextual, passiva, associada a um elemento | Ponto verde ao lado do nome do paciente indicando "prontuário aberto hoje"; seta de tendência em indicador de frequência de sessões. |
| **Validation** | Erro de input do usuário, exige ação para continuar | Campo de CPF inválido destacado em vermelho com mensagem "CPF deve ter 11 dígitos". |
| **Notification** | Evento do sistema não ligado à ação imediata do usuário | "Sessão de amanhã foi remarcada pelo paciente" — toast não-modal no canto superior. |

**Regras críticas:**
- **Nunca** usar notificação para algo que deveria ser indicador.
- **Nunca** usar toast/passive notification para erro que bloqueia progresso.
- **Nunca** usar apenas cor para indicar erro (sempre ícone + texto, para daltonismo).

### 6.2 Padrões de micro-interação recomendados

Baseado em "Top 10 Application-Design Mistakes" (NNGroup, 2019) e guidelines de erro:

**A. Feedback imediato e visível**
- Botões devem ter estado visual de "pressionado".
- Campos em edição devem ter destaque claro (ex: mudança de fundo, borda).
- Salvamento automático deve ter indicador discreto (ex: "Salvo às 14:32" em cinza, não popup).

**B. Estados de progresso**
- 0,1–2s: nenhum indicador necessário.
- 2–10s: spinner/wait animation.
- >10s: barra de progresso explícita (percent-done).

**C. Erros que preservam esforço**
- Preservar todo o input do usuário quando um erro ocorre.
- Permitir correção no lugar, sem reiniciar o formulário.
- Sugerir a correção quando possível (ex: "Você quis dizer: ___?").

**D. Confirmações diferenciadas por severidade**
- Ações destrutivas (excluir prontuário, excluir sessão): modal explícito com texto da ação.
- Ações reversíveis (excluir rascunho): undo/toast, não modal.
- Ações rotineiras (salvar): nenhuma confirmação, apenas indicador de estado.

**Fonte:** Flaherty K. "Indicators, Validations, and Notifications." NNGroup, 2024.  
**Fonte:** Nielsen J, Laubheimer P. "Top 10 Application-Design Mistakes." NNGroup, 2019.  
**Fonte:** Neusesser T, Sunwall E. "Error-Message Guidelines." NNGroup, 2023.

---

## 7. Erros de UX comuns em software de gestão para terapeutas

### 7.1 Erros universais de aplicações (aplicáveis a PsiVault)

De acordo com a NNGroup (2019), os 10 erros mais comuns em aplicações complexas:

1. **Poor feedback** — sistema não informa estado atual.  
   *Risco para PsiVault:* psicólogo não sabe se a nota foi salva ou se está editando o campo certo.

2. **Inconsistência** — mesma ação em lugares diferentes, termos diferentes para a mesma coisa.  
   *Risco:* "Anotação de sessão" em um lugar, "Evolução" em outro, "Nota" em um terceiro.

3. **Bad error messages** — "Algo deu errado. Tente novamente."  
   *Risco:* mensagens genéricas em falhas de salvamento, perda de dados do usuário sem explicação.

4. **No default values** — forçar o usuário a selecionar tudo do zero a cada vez.  
   *Risco:* formulário de nova sessão sempre em branco, mesmo quando 90% das sessões usam os mesmos campos.

5. **Unlabeled icons** — ícones sem texto.  
   *Risco:* ícones abstratos na sidebar que o psicólogo precisa adivinhar.

6. **Hard-to-acquire targets** — botões pequenos, designs ultra-flat sem signifiers.  
   *Risco:* psicólogo mais velho não consegue distinguir botão de texto inativo.

7. **Overuse of modals** — modais cobrindo informação contextual necessária.  
   *Risco:* modal de "nova sessão" cobrindo o histórico do paciente que o psicólogo precisa consultar.

8. **Meaningless information** — IDs e códigos como informação primária.  
   *Risco:* listagem de pacientes mostrando "pat_7f3a9b2" em destaque em vez do nome.

9. **Junk-drawer menus** — menu "Mais" ou "..." com funções escondidas.  
   *Risco:* funcionalidades importantes (ex: emitir declaração, visualizar recibos) enterradas em menus genéricos.

10. **Proximity of destructive and confirmation actions** — "Salvar" e "Descartar" lado a lado.  
   *Risco:* clique acidental em "Excluir sessão" ao lado de "Salvar nota".

### 7.2 Erros específicos de EHRs / prontuários eletrônicos

Da revisão de Budd (2023) e Windle et al. (2021):

| Erro | Por que acontece | Como evitar em PsiVault |
|------|------------------|-------------------------|
| **Note bloat / notas inchadas** | Copy-paste de notas anteriores + templates redundantes | Dados estruturados separados de notas narrativas; templates inteligentes que se adaptam ao paciente. |
| **Alert fatigue** | Alertas para tudo = alertas para nada | Apenas alertas clinicamente relevantes (ex: paciente sem sessão há X dias); não notificar por métricas administrativas. |
| **Cognitive overload** | Muitos dados, mal organizados, exigindo cliques excessivos | Problemas como âncora; push de dados relevantes; telas com densidade controlada. |
| **After-hours charting** | EHR lento e frustrante durante o expediente → trabalho noturno | Interface rápida, com atalhos de teclado, templates eficientes, fluxo de documentação integrado à agenda. |
| **Inbox/message overload** | Mensagens de pacientes por portal + tarefas administrativas não filtradas | Fila de tarefas priorizada; separar comunicação clínica de administrativa; indicadores de urgência claros. |

### 7.3 Erros de tom e vocabulário (específico do domínio psicológico)

Conforme as regras de marca de PsiVault:

| Erro proibido | Por que é um erro | O que fazer |
|---------------|-------------------|-------------|
| "Revolucione sua rotina clínica" | Tom de coach/wellness; vazio operacional | Usar linguagem concreta: "organize seus atendimentos", "mantenha o prontuário atualizado". |
| "Potencialize seus atendimentos" | Hype tecnológico; soa como startup genérica | Descrever funcionalidades em termos de ação: "agende, documente, acompanhe". |
| "IA que entende você" | AI gimmick; promessa falsa para clínica | Se houver IA, descrever o que faz especificamente (ex: "sugere datas baseadas na frequência do paciente"). |
| Jargão burocrático como voz principal | Frieza hospitalar; distância do usuário | Voz direta, madura, específica: "prontuário", "atendimento", "sigilo", "recibo". |

---

## Sumário Executivo — Recomendações Prioritárias para PsiVault

### Must-have (impacto alto / esforço médio)
1. **Organizar o prontuário em torno do paciente e seus problemas**, não de documentos. Usar a lista de problemas como âncora de navegação.
2. **Implementar progressive disclosure** em formulários clínicos: mostrar campos essenciais, esconder avançados.
3. **Light mode como default**, com dark mode persistente e respeito à preferência do sistema operacional.
4. **Salvamento automático com indicador discreto** (nunca popup). Preservar input em todo erro.
5. **Nunca usar apenas cor** para comunicar status crítico; sempre parear com ícone ou texto.

### Should-have (impacto alto / esforço médio-alto)
6. **Separar visualização de documentação**: o psicólogo deve poder ver dados do paciente sem copiá-los para a nota.
7. **Dados em 3 estados** (coletado → clarificado → verificado) para reduzir reescrita.
8. **Feedback hierárquico**: indicators para status passivos, validations para erros de input, notifications apenas para eventos do sistema.
9. **Telas com densidade controlada**: máximo 3–5 opções enfatizadas por tela (regra do Inspired EHRs).
10. **Onboarding progressivo e não bloqueante**: dicas contextuais em vez de tutoriais obrigatórios.

### Avoid (anti-padrões destrutivos)
11. **Não criar "note bloat"**: evitar templates que gerem texto irrelevante.
12. **Não usar modais para tudo**: preferir edição inline quando possível.
13. **Não enterrar funções em menus genéricos** ("Mais", "...").
14. **Não colocar ações destrutivas próximas a ações de confirmação**.
15. **Não enviar notificações irrelevantes**: respeitar a atenção do clínico (princípios de Calm Technology).

---

## Referências Bibliográficas

1. Windle JR et al. "Roadmap to a more useful and usable electronic health record." *Cardiovasc Digit Health J*. 2021;2(6):301–311. PMCID: PMC8890352.
2. Budd J. "Burnout Related to Electronic Health Record Use in Primary Care." *J Prim Care Community Health*. 2023;14:21501319231166921. PMCID: PMC10134123.
3. Mazur LM et al. "Association of the Usability of Electronic Health Records With Cognitive Workload and Performance Levels Among Physicians." *JAMA Netw Open*. 2019;2(4):e191709. PMCID: PMC6450327.
4. Kang C, Sarkar IN. "Interventions to Reduce Electronic Health Record-Related Burnout: A Systematic Review." *Appl Clin Inform*. 2024;15(1):10–25. PMCID: PMC10764123.
5. Budiu R. "Dark Mode vs. Light Mode: Which Is Better?" Nielsen Norman Group, 2020.
6. Piepenbrock C et al. "Positive display polarity is advantageous for both younger and older adults." *Ergonomics*, 2013.
7. Dobres J et al. "Effects of ambient illumination, contrast polarity, and letter size on text legibility under glance-like reading." *Applied Ergonomics*, 2017.
8. Aleman A et al. "Reading and Myopia: Contrast Polarity Matters." *Scientific Reports*, 2018.
9. Legge GE et al. "Psychophysics of Reading – II. Low Vision." *Vision Research*, 1985.
10. W3C WAI. "WCAG 2 Overview." https://www.w3.org/WAI/standards-guidelines/wcag/
11. Case A. "Principles of Calm Technology." https://calmtech.com/
12. Kane L. "The Attention Economy." Nielsen Norman Group, 2019.
13. Nielsen J. "Progressive Disclosure." Nielsen Norman Group, 2006.
14. Nielsen J, Laubheimer P. "Top 10 Application-Design Mistakes." Nielsen Norman Group, 2019.
15. Flaherty K. "Indicators, Validations, and Notifications: Pick the Correct Communication Option." Nielsen Norman Group, 2024.
16. Neusesser T, Sunwall E. "Error-Message Guidelines." Nielsen Norman Group, 2023.
17. Inspired EHRs. "Designing for Clinicians." http://inspiredehrs.org/ (acessado em 2026).
18. HealthIT.gov. "Usability and Provider Burden." ONC. https://www.healthit.gov/topic/usability
