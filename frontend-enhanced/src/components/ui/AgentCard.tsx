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
        w-[calc(100%-1rem)] mx-auto flex items-center gap-4 py-2 px-3 rounded-[2rem] transition-all duration-300 text-left group
        min-h-[64px]
        relative overflow-visible
        ${isActive
                    ? 'bg-gradient-to-r from-accent/20 via-accent/5 to-transparent shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]'
                    : 'hover:bg-white/5 hover:shadow-lg hover:shadow-black/20'
                }
      `}
        >
            <div className={`
        flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300
        ${isActive ? 'bg-accent/20 text-accent shadow-[0_0_10px_-2px_rgba(56,189,248,0.4)]' : 'bg-white/5 text-textSecondary group-hover:text-white group-hover:bg-white/10'}
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
