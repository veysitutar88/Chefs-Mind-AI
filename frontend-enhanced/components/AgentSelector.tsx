'use client';

import { useState } from 'react';

interface AgentSelectorProps {
  onAgentSelect: (agent: string) => void;
}

export default function AgentSelector({ onAgentSelect }: AgentSelectorProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('Chef');

  const agents = ['Chef', 'Accountant', 'Researcher', 'Media Studio'];

  const handleAgentSelect = (agent: string) => {
    setSelectedAgent(agent);
    onAgentSelect(agent);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-md">
      <h2 className="text-xl font-bold mb-4">Выбор AI-агента</h2>
      <div className="flex flex-wrap gap-2">
        {agents.map(agent => (
          <button
            key={agent}
            onClick={() => handleAgentSelect(agent)}
            className={`px-4 py-2 rounded transition-colors ${
              selectedAgent === agent
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {agent}
          </button>
        ))}
      </div>
    </div>
  );
}
