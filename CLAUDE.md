# PsiLock — Prontuário Eletrônico para Psicólogos

## Stack
- **Next.js 15** (App Router, React 19, Server Components)
- **TypeScript 5.8** (strict)
- **Prisma 6** + PostgreSQL (Supabase)
- **Supabase Auth** (SSR)
- **Vitest** (node env, globals)
- **pnpm 8**
- **CSS**: inline `React.CSSProperties` + CSS vars em `globals.css`
- **i18n**: pt-BR (UI em português)

## Arquitetura

### Repository Pattern
- Interfaces em `src/lib/[domain]/repository.ts`
- Implementações Prisma em `src/lib/[domain]/repository.prisma.ts`
- Singletons em `src/lib/[domain]/store.ts` (via `globalThis`)
- **Nunca** chamar Prisma direto em componentes ou actions

### Domain Models
- Modelos canônicos em `src/lib/[domain]/model.ts` (separados do Prisma)
- Factories com injeção de `now` e `createId` para testabilidade
- IDs com prefixo: `pat_`, `appt_`, `ws_`, `acct_`
- Soft deletes: `deletedAt` + `deletedByAccountId`

### Server Actions
- Arquivo `actions.ts` colocado junto às pages
- Sempre `"use server"` no topo
- Validar workspace + role em toda mutation

### Roteamento
- `(auth)` — rotas públicas de autenticação
- `(vault)` — rotas protegidas (middleware valida sessão)
- Middleware em `src/middleware.ts`

## Convenções

### Código
- camelCase para arquivos/funções, PascalCase para componentes/types
- Imports com `@/*` (alias para `src/`)
- Timestamps ISO 8601, sufixo `_at` no banco
- Estilos inline com `satisfies React.CSSProperties`
- Campos sensíveis (`importantObservations`) nunca em listagens

### Testes
- Em `/tests/**/*.test.ts`
- Repositórios in-memory para unit tests
- `pnpm test` roda vitest

### Banco
- Todo query deve ter escopo de `workspaceId`
- Índices compostos: `[workspaceId, ...]`
- Enums: `AppointmentStatus`, `ServiceMode`, `AppointmentCareMode`

## Regras

- Não criar arquivos desnecessários — editar existentes
- Não adicionar features além do pedido
- Não poluir com comentários/docstrings onde não mudou
- Respostas curtas e diretas, em português quando falando comigo
- Usar Context7 para docs atualizadas de Next.js, Prisma, Supabase
- Usar Serena para navegação semântica do código

## Posicionamento Psicanalítico

### Nome de produto
- **PsiVault** — nome do produto em UI, copy, landing e comunicação com o usuário (botões, labels, mensagens, título do browser, marketing)
- **PsiLock** — nome técnico do repositório (código, variáveis de ambiente, paths, documentação interna de dev, nomes de package)
- Nunca usar PsiLock em copy voltado ao usuário. Nunca usar PsiVault em nomes de variáveis, imports ou paths de código.

### Vocabulário obrigatório

| Use | Não use |
|-----|---------|
| paciente | cliente, usuário |
| atendimento | serviço, sessão genérica |
| prontuário | ficha, registro |
| acompanhamento | tratamento, programa |
| escuta | suporte, ajuda |

Termos psicanalíticos — `transferência`, `inconsciente`, `sintoma` — usar apenas em contexto clínico correto, nunca como metáfora de produto ("a transferência de dados", "o inconsciente do sistema").

### Anti-padrões de tom

Frases proibidas (nunca usar, nem variantes):
- "Revolucione sua rotina clínica"
- "Potencialize seus atendimentos"
- "IA que entende você"
- "Transforme sua prática"
- "Ferramenta inteligente para psicólogos"

Tom proibido:
- Linguagem de coach ou wellness brand
- Slogans vazios sem substância operacional
- Hype tecnológico ou AI gimmick
- Jargão burocrático ou jurídico como voz principal

### Regras do Assistente de Pesquisa (plano premium)

O que faz:
- Resume conceitos psicanalíticos de obras em domínio público
- Indica obras e pensadores para estudo
- Constrói bibliografias anotadas por linha teórica
- Compara conceitos entre diferentes escolas (Freud, Lacan, Winnicott, Klein, Bion)

O que não faz:
- Não reproduz textos protegidos por copyright
- Não faz diagnóstico clínico nem sugere condutas terapêuticas
- Não simula analista nem substitui supervisão
- Não gera conclusões clínicas sobre casos reais

### Limites de copyright
- Resumos, paráfrases e conceitos: permitidos
- Citações curtas (até 3–4 frases) com atribuição: permitidas
- Capítulos, seções extensas ou obras completas: proibido reproduzir
- Obras em domínio público (ex: Freud em português/alemão): texto integral permitido se licença verificada
- Regra geral: indicar a obra, não substituí-la

### Anti-padrões visuais (app interno)
(Esta subseção governa o produto, não apenas a landing)
- Sem gradientes decorativos em superfícies funcionais (sidebar, cards, formulários)
- Sombras contidas: usar apenas `--shadow-sm` e `--shadow-md` — nunca sombras exageradas para "efeito"
- Animações só quando melhoram orientação ou resposta de interação — nunca decorativas
- Sem badges, chips coloridos ou indicadores de "novidade" sem função real
- Hierarquia via tipografia e espaçamento — não via cor excessiva

## Direção de Marca — Landing PsiVault

### Tese
- PsiVault deve parecer um produto sério para psicólogos brasileiros
- A landing precisa transmitir calma, sigilo, organização e maturidade
- O produto não é fintech, não é wellness influencer, não é AI gimmick

### Sensação da marca
- discreta
- premium sem exibicionismo
- clinicamente profissional sem frieza hospitalar
- clara, estável e confiável
- desenhada com ritmo editorial e muito espaço

### Copy da landing
- Todo o texto em **pt-BR**
- Vocabulário concreto: `rotina clínica`, `prontuário`, `agenda`, `documentos`, `sigilo`, `recibos`, `declarações`, `atendimento online e presencial`, `acompanhamento`
- Tom direto, maduro e específico
- Evitar hype, slogans vazios e linguagem de startup
- Não usar jargão burocrático ou jurídico como voz principal
- Não soar como coach, wellness brand ou software genérico

### Regras visuais da landing
- Priorizar hierarquia tipográfica, grid limpo e respiro
- Paleta principal: off-white quente, charcoal profundo, sage suave
- Sombras contidas, raios discretos, contraste calmo
- Mockups devem parecer interfaces plausíveis, nunca dashboards fantasiosos
- Movimento só quando melhorar leitura, foco ou resposta de interação

### Anti-padrões
- nada de glow, glassmorphism chamativo ou gradientes espalhafatosos
- nada de visual crypto/fintech/AI
- nada de mockup flutuante fake
- nada de blocos soltos sem narrativa
- nada de ilustração genérica de marketing
- nada de frases como “revolucione sua rotina”

### Regras de confiança
- Não prometer certificações ou garantias regulatórias sem base explícita no produto
- Segurança deve ser comunicada com fatos do sistema: sessões, ações sensíveis, backup, exportação, organização de acesso
- Sempre preferir linguagem de cuidado operacional a promessas vagas de “segurança de ponta”
