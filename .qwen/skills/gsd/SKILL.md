---
name: gsd
description: Get Shit Done — A meta-prompting, context engineering and spec-driven development system for solo development with AI agents. Plan, execute, verify, and maintain project state.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
---

# Get Shit Done (GSD) — Qwen Code Edition

A meta-prompting, context engineering and spec-driven development system. Solves "context rot" by maintaining structured planning, execution, verification, and state tracking.

## When to Use

- User wants to plan a feature or phase → `/gsd plan`
- User wants to execute planned work → `/gsd execute`
- User wants to verify completed work → `/gsd verify`
- User wants to start a new project workflow → `/gsd init-project`
- User has a freeform intent → `/gsd do <description>`
- User needs help → `/gsd help`

## Core Commands

| Command | Description |
|---------|-------------|
| `/gsd help` | Show full command reference |
| `/gsd do <text>` | Smart dispatcher — routes intent to best GSD command |
| `/gsd init-project` | Initialize GSD workflow for a project |
| `/gsd plan <phase>` | Plan a specific phase with task breakdown |
| `/gsd execute <phase>` | Execute a planned phase with atomic commits |
| `/gsd verify` | Verify phase objectives are met |
| `/gsd quick <text>` | Fast-track small tasks (< 30 min) |
| `/gsd fast <text>` | Ultra-fast trivial tasks (< 5 min) |
| `/gsd status` | Show current project state |
| `/gsd state` | Manage project state (save/load/patch) |
| `/gsd roadmap` | Show or update the project roadmap |
| `/gsd checkpoint` | Create a checkpoint of current state |
| `/gsd research <topic>` | Research a topic for the current phase |
| `/gsd review` | Code review of recent changes |
| `/gsd security` | Security audit of codebase |
| `/gsd codebase-map` | Map the current codebase structure |

## How It Works

GSD uses a structured directory under `.planning/` to maintain project state:

```
.planning/
├── PROJECT.md          # Project vision and goals
├── ROADMAP.md          # Phase breakdown with dependencies
├── STATE.md            # Current state, decisions, metrics
├── REQUIREMENTS.md     # Requirements with IDs
├── config.json         # Workflow mode (interactive/yolo)
├── phases/             # Per-phase plans and summaries
│   └── <NN>-<name>/
│       ├── <NN>-<NN>-PLAN.md
│       ├── <NN>-<NN>-SUMMARY.md
│       └── <NN>-CONTEXT.md
└── milestones/         # Completed milestones
```

## Workflow Cycle

1. **Initialize**: `/gsd init-project` — Sets up `.planning/` structure
2. **Plan**: `/gsd plan <phase>` — Creates detailed PLAN.md with task breakdown
3. **Execute**: `/gsd execute <phase>` — Executes plan with atomic commits
4. **Verify**: `/gsd verify` — Checks objectives are met (goal-backward chaining)
5. **Repeat**: Move to next phase

## GSD Tools CLI

The core technical engine is a Node.js CLI at:
`.claude/get-shit-done/bin/gsd-tools.cjs`

Available subcommands:
- `state load|save|update|patch|advance-plan|record-metric`
- `phase next-decimal|add|insert|remove|complete`
- `roadmap get-phase|analyze|update-plan-progress`
- `commit <msg> --files f1 f2`
- `verify plan-structure|phase-completeness|references|commits|artifacts`
- `template fill summary|plan|verification`
- `init execute-phase|plan-phase|new-project|quick|todos`

Usage: `node .claude/get-shit-done/bin/gsd-tools.cjs <subcommand> [args]`

## Key Principles

1. **Context preservation** — State files keep context across sessions boundaries
2. **Atomic commits** — Each logical change is committed separately with clear messages
3. **Verification-first** — Always verify before marking complete
4. **Phase gates** — Phases have entry/exit gates with criteria
5. **Backward chaining** — Verify from goal back to current state

## Agents

GSD uses specialized agents (stored in `.claude/agents/`) for different roles:
- **gsd-planner** — Creates plans with task breakdown and dependencies
- **gsd-executor** — Executes plans with atomic commits
- **gsd-verifier** — Verifies objectives are met
- **gsd-code-reviewer** — Reviews code quality
- **gsd-security-auditor** — Security audits
- **gsd-debugger** — Systematic debugging
- **gsd-roadmapper** — Manages project roadmap
- **gsd-doc-writer** — Writes documentation

To use an agent, invoke the Agent tool with the appropriate agent file as context.

## Configuration

Project config: `.planning/config.json`
```json
{
  "workflow": "interactive",
  "hooks": {
    "workflow_guard": true,
    "context_monitor": true
  }
}
```

## References

Detailed reference documentation is available at:
`.claude/get-shit-done/references/`

Key references:
- `agent-contracts.md` — How agents communicate
- `checkpoints.md` — Checkpoint system
- `gates.md` — Phase entry/exit gates
- `verification-*.md` — Verification procedures
- `thinking-models-*.md` — Thinking models for different tasks

## Templates

Workflow templates at: `.claude/get-shit-done/templates/`

## Important Notes for Qwen Code

This is an adaptation of the GSD system (originally built for Claude Code) for Qwen Code.
- The `.claude/get-shit-done/` directory contains the core tools, workflows, and references
- The `.planning/` directory contains project state (agent-agnostic)
- Commands are invoked via `/gsd <command>` — Qwen Code should recognize this skill
- The `gsd-tools.cjs` CLI works identically regardless of the host AI
