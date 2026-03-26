# Stack Research — v2.0 Reposicionamento Psicanalítico

## Question
Quais adições ou mudanças de stack são necessárias para as novas features do v2.0?

## Findings

### Adições necessárias

**Landing page / marketing:**
- Nenhuma lib obrigatória — Next.js App Router já suporta rotas de landing no root. Usar Server Components puros com React.CSSProperties para consistência com o projeto.
- Para animações sutis: `framer-motion` (já pode estar no projeto ou a adicionar) — verificar antes de adicionar.
- Sem MDX/CMS necessário para v2.0; copy pode ficar em componentes tsx com constantes de string.

**Pricing/premium plan UI:**
- Sem dependências extras. Componentes de pricing são UI pura com Server Components.

**AI research assistant:**
- `@anthropic-ai/sdk` (latest) — para integrar Claude API como backend do assistente de pesquisa psicanalítica.
- Integração via Server Action ou Route Handler em Next.js 15 — streaming de resposta com `ReadableStream`.
- Modelo recomendado: claude-sonnet-4-6 ou claude-haiku-4-5 (menor custo para consultas frequentes).
- Armazenar preferências do usuário (pensador/linha) em tabela `workspace_settings` ou `account_settings`.

**PDF / documents:**
- Stack atual (já existente): verificar se usa `@react-pdf/renderer` ou `puppeteer`/`playwright` headless.
- Para v2.0: manter stack existente, melhorar templates de documentos (design, headers, tipografia).

**Copy management:**
- Sem i18n lib necessária — app é pt-BR exclusivo. Centralizar strings em `src/lib/copy/` como objetos TypeScript exportados.

### O que NÃO adicionar
- CMS headless (Contentful, Sanity) — overkill para produto com copy em pt-BR fixo
- i18n lib (next-intl) — não há multi-idioma
- Embedding/vector store para AI — assistente de pesquisa usa Claude diretamente, sem RAG próprio no v2.0
- Biblioteca de terceiros para "clinic management" — o produto JÁ TEM os módulos, v2.0 é repositioning não rebuild

### Versões a verificar
- `@anthropic-ai/sdk`: `^0.39.0` (Claude 4.x)
- `next`: `15.x` (já instalado)
- Verificar `framer-motion` se já presente antes de adicionar

## Conclusion
O v2.0 é primariamente um trabalho de copy, identidade e posicionamento — não um projeto de infra heavy. A única adição real de dependência é `@anthropic-ai/sdk` para o assistente premium. Todo o resto é configuração, copy e componentes UI dentro do stack existente.
