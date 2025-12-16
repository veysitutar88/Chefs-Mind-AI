import React from 'react';
import { Logo } from '../ui/Logo';
import { AgentCard } from '../ui/AgentCard';
import { AgentConfig, AgentId } from '@/types/ui';
import { Settings, Sparkles } from 'lucide-react';

interface AgentSidebarProps {
    agents: AgentConfig[];
    activeAgentId: AgentId;
    onAgentSelect: (id: AgentId) => void;
    className?: string;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({
    agents,
    activeAgentId,
    onAgentSelect,
    className = ''
}) => {
    const [showSettings, setShowSettings] = React.useState(false);
    const [showModelInfo, setShowModelInfo] = React.useState(false);

    return (
        <aside className={`h-full flex flex-col bg-surface/50 border-r border-borderSoft/50 backdrop-blur-sm p-4 gap-6 ${className}`}>

            {/* Header: Logo */}
            <div className="flex items-center justify-center py-2">
                <Logo className="opacity-90 hover:opacity-100 transition-opacity" size="medium" />
            </div>

            {/* Body: Agent List */}
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {agents.map(agent => (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        isActive={activeAgentId === agent.id}
                        onClick={onAgentSelect}
                    />
                ))}
            </div>

            {/* Footer: User Profile & Settings */}
            <div className="mt-auto pt-4 border-t border-borderSoft/50 space-y-4">

                {/* Model Status Indicator */}
                <div className="relative">
                    <button
                        onClick={() => setShowModelInfo(!showModelInfo)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 border border-white/5 hover:bg-white/5 transition-colors text-left"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-accent/20 text-accent">
                                <Sparkles size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-textSecondary font-semibold">Model</span>
                                <span className="text-xs text-textPrimary font-medium">Gemini 3 Pro</span>
                            </div>
                        </div>
                    </button>
                    {showModelInfo && (
                        <div className="absolute bottom-full left-0 mb-2 w-full bg-surface border border-borderSoft p-3 rounded-lg shadow-xl z-50 text-xs text-textSecondary animate-in fade-in slide-in-from-bottom-2">
                            <p className="mb-1 text-textPrimary font-medium">Auto-Switching</p>
                            LLM model routing is managed by the orchestrator.
                        </div>
                    )}
                </div>

                {/* User Profile Row */}
                <div className="flex items-center gap-3 px-1 relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accentSoft flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-background">
                        CM
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-textPrimary truncate">Chef Admin</div>
                        <div className="text-[10px] text-textSecondary truncate">admin@chefsmind.ai</div>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-accent bg-accent/10' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
                    >
                        <Settings size={18} />
                    </button>

                    {/* Settings Stub Modal */}
                    {showSettings && (
                        <div className="absolute bottom-full right-0 mb-4 w-64 bg-surface border border-borderSoft rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                            <h3 className="font-semibold text-textPrimary mb-3 flex items-center gap-2">
                                <Settings size={14} /> Settings
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-textSecondary block mb-1.5">Theme</label>
                                    <div className="flex bg-background/50 p-1 rounded-lg border border-white/5">
                                        <button className="flex-1 py-1 px-2 text-xs rounded bg-surface shadow-sm text-textPrimary font-medium">Dark</button>
                                        <button className="flex-1 py-1 px-2 text-xs rounded text-textSecondary hover:text-textPrimary opacity-50 cursor-not-allowed">Light</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-textSecondary block mb-1.5">Language</label>
                                    <div className="flex bg-background/50 p-1 rounded-lg border border-white/5">
                                        <button className="flex-1 py-1 px-2 text-xs rounded bg-surface shadow-sm text-textPrimary font-medium">EN</button>
                                        <button className="flex-1 py-1 px-2 text-xs rounded text-textSecondary hover:text-textPrimary opacity-50 cursor-not-allowed">RU</button>
                                    </div>
                                </div>
                                <div className="text-xs text-accent bg-accent/10 p-2 rounded">
                                    Advanced settings will be added later.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
