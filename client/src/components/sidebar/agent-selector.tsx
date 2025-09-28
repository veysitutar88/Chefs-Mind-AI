import { Button } from "@/components/ui/button";
import type { Agent } from "@/types";

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent;
  onAgentSelect: (agent: Agent) => void;
}

export function AgentSelector({ agents, selectedAgent, onAgentSelect }: AgentSelectorProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">ИИ Агенты</h3>
      <div className="space-y-3">
        {agents.map((agent) => (
          <Button
            key={agent.id}
            variant="ghost"
            className={`w-full justify-start p-4 h-auto transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg ${
              selectedAgent.id === agent.id
                ? agent.color
                : 'bg-card hover:bg-muted border border-border'
            }`}
            onClick={() => onAgentSelect(agent)}
            data-testid={`button-agent-${agent.id}`}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedAgent.id === agent.id
                  ? 'bg-primary-foreground/20'
                  : agent.color
              }`}>
                <i className={`${agent.icon} text-lg`}></i>
              </div>
              <div className="text-left">
                <h4 className="font-medium">{agent.name}</h4>
                <p className="text-xs opacity-90">{agent.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
