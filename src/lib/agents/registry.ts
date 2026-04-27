import type { Agent } from "./model";

export interface AgentRegistry {
  register(agent: Agent): void;
  unregister(agentId: string): boolean;
  get(agentId: string): Agent | undefined;
  list(): Agent[];
  has(agentId: string): boolean;
}

export function createAgentRegistry(): AgentRegistry {
  const agents = new Map<string, Agent>();

  return {
    register(agent) {
      if (agents.has(agent.id)) {
        throw new Error(`Agent "${agent.id}" is already registered. Unregister first if you want to replace it.`);
      }
      agents.set(agent.id, agent);
    },
    unregister(agentId) {
      return agents.delete(agentId);
    },
    get(agentId) {
      return agents.get(agentId);
    },
    list() {
      return Array.from(agents.values());
    },
    has(agentId) {
      return agents.has(agentId);
    },
  };
}
