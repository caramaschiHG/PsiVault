# GSD — Como Usar no Qwen Code

## Instalação Completa ✅

O sistema GSD (Get Shit Done) está configurado neste projeto com:

- **Skill do Qwen Code**: `.qwen/skills/gsd/SKILL.md`
- **Core GSD**: `.claude/get-shit-done/` (tools, workflows, references, templates)
- **Estado do projeto**: `.planning/`
- **CLI Tools**: `node .qwen/skills/gsd/gsd-tools.js`

## Comandos Rápidos

### Para começar um workflow:

```
/gsd init-project    # Inicializa o workflow GSD no projeto
/gsd help            # Mostra todos os comandos
```

### Ciclo básico:

```
/gsd plan 1          # Planeja a fase 1
/gsd execute 1       # Executa a fase 1
/gsd verify          # Verifica se está completo
```

### Tarefas rápidas:

```
/gsd do "adicionar autenticação JWT"  # Dispatcher inteligente
/gsd quick "corrigir typo no README"  # Tarefa rápida (< 30 min)
/gsd fast "renomear variável"          # Tarefa trivial (< 5 min)
```

### Estado e progresso:

```
/gsd status          # Mostra estado atual
/gsd roadmap         # Mostra roadmap do projeto
/gsd checkpoint      # Salva checkpoint
```

### Via CLI direta:

```bash
# Usar o CLI do GSD diretamente:
node .qwen/skills/gsd/gsd-tools.js state save
node .qwen/skills/gsd/gsd-tools.js phase next-decimal
node .qwen/skills/gsd/gsd-tools.js roadmap get-phase
node .qwen/skills/gsd/gsd-tools.js verify plan-structure
```

## Estrutura de Arquivos

```
.qwen/skills/gsd/           # Skill do Qwen Code
├── SKILL.md                # Referência principal
├── README.md               # Este arquivo
├── gsd-tools.js            # Wrapper CLI
└── commands/               # Comandos customizados

.claude/get-shit-done/      # Core do GSD (não mexer)
├── bin/gsd-tools.cjs       # CLI principal
├── workflows/              # Definições de workflow
├── references/             # Documentação de referência
├── templates/              # Templates de artefatos
└── contexts/               # Contextos por tipo

.planning/                  # Estado do projeto
├── PROJECT.md
├── ROADMAP.md
├── STATE.md
├── REQUIREMENTS.md
├── config.json
└── phases/
```

## Notas

- O GSD foi originalmente feito para Claude Code, adaptado para Qwen Code
- A estrutura `.planning/` é agnóstica ao agente — funciona com qualquer AI
- Os workflows em `.claude/get-shit-done/workflows/` são prompts reutilizáveis
