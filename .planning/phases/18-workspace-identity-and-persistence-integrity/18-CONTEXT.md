# Phase 18 Context: Tipos de Notificação e Ações

## Canonical References
- ROADMAP.md (Phase 18 requirements)

## Locked Decisions

- **Estilo Visual e Ícones:**
  - **Estilo dos Ícones:** Contornados (Outline). Mantém a interface leve e limpa.
  - **Tratamento de Cor:** Fundo do card inteiro levemente colorido (ex: `bg-opacity-10` ou equivalente sutil) com a cor correspondente a cada tipo de notificação, conforme especificado nos critérios de sucesso.

- **Comportamento das Ações:**
  - **Ao clicar (Navegação):** Fecha o dropdown de notificações imediatamente e realiza a navegação na mesma aba, seguindo o padrão de Single Page Application.

- **Expansão do tipo "Update":**
  - **Comportamento:** Expansão em estilo sanfona (accordion). Empurra os outros itens do dropdown suavemente para baixo para revelar os detalhes do changelog/versão, mantendo o usuário no contexto sem usar overlays adicionais.

## Deferred Ideas
- Nenhuma ideia adiada identificada nesta discussão.
