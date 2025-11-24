import React from 'react';
import { AgentConfig } from '../types';
import { ChefHat, Calculator, Compass, Image as ImageIcon } from 'lucide-react';

interface AgentCardProps {
  agent: AgentConfig;
  isActive: boolean;
  onClick: (id: AgentConfig['id']) => void;
}

const Icons = {
  chef_hat: ChefHat,
  calculator: Calculator,
  compass: Compass,
  image: ImageIcon,
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, onClick }) => {
  const Icon = Icons[agent.iconName];

  return (
    <button
      onClick={() => onClick(agent.id)}
      className={`
        w-full flex items-center gap-4 p-4 rounded-[22px] transition-all duration-300 text-left group
        border 
        ${isActive 
          ? 'bg-[#152033] border-accent shadow-glow-active scale-[1.02]' 
          : 'bg-surface border-transparent hover:border-borderSoft hover:bg-[#1A2438] hover:shadow-lg'
        }
      `}
    >
      <div className={`
        flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
        ${isActive ? 'bg-accent/20 text-accent' : 'bg-background text-textSecondary group-hover:text-accentSoft'}
      `}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      
      <div className="flex flex-col min-w-0">
        <span className={`font-semibold text-base truncate transition-colors ${isActive ? 'text-accent' : 'text-textPrimary'}`}>
          {agent.title}
        </span>
        <span className="text-xs text-textSecondary leading-snug line-clamp-2">
          {agent.subtitle}
        </span>
      </div>
    </button>
  );
};
