import React from 'react';
import { AgentConfig } from '@/types/ui';
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
        w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left group
        border 
        ${isActive
                    ? 'background-surface border-accent/30 background-glow-active scale-[1.02]'
                    : 'background-surface/50 border-transparent hover:border-white/10 background-surface hover:shadow-premium hover:scale-[1.02]'
                }
      `}
        >
            <div className={`
        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors
        ${isActive ? 'background-accent/20 text-accent' : 'background-white/5 text-textSecondary group-hover:text-textPrimary group-hover:background-white/10'}
      `}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>

            <div className="flex flex-col min-w-0">
                <span className={`font-semibold text-base truncate transition-colors ${isActive ? 'text-accent' : 'text-textPrimary group-hover:text-white'}`}>
                    {agent.title}
                </span>
                <span className="text-xs text-textSecondary leading-snug line-clamp-2 group-hover:text-textSecondary/80">
                    {agent.subtitle}
                </span>
            </div>
        </button>
    );
};
