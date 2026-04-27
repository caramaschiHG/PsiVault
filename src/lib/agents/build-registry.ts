import type { AgentRegistry } from "./registry";
import { createAgentRegistry } from "./registry";
import { createAgendaAgent } from "./agenda";

/**
 * Build a production agent registry with all registered agents.
 *
 * Use this in cron handlers, tests, and any entry point that needs
 * a fully-populated registry. Avoid inline registration scattered
 * across call sites.
 */
export function buildAgentRegistry(): AgentRegistry {
  const registry = createAgentRegistry();

  // Agenda Agent — Phase 44
  registry.register(createAgendaAgent());

  return registry;
}
