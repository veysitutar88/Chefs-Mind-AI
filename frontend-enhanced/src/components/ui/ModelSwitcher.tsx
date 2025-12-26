import React, { useState, useEffect } from 'react';
import { ChevronDown, Cpu, Check } from 'lucide-react';

interface AgentModelOption {
    id: string;
    label: string;
    provider: string;
    kind: string;
    default?: boolean;
}

interface ModelSwitcherProps {
    agentKey: "souschef" | "gastrocount" | "gastromind" | "foodframe";
    selectedModelId: string | null;
    onChange: (modelId: string) => void;
}

export const ModelSwitcher: React.FC<ModelSwitcherProps> = ({
    agentKey,
    selectedModelId,
    onChange
}) => {
    const [models, setModels] = useState<AgentModelOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5002/api/models?agentKey=${agentKey}`);
                if (res.ok) {
                    const data = await res.json();
                    setModels(data.models);
                }
            } catch (error) {
                console.error("Failed to load models", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [agentKey]);

    const currentModel = models.find(m => m.id === selectedModelId) || models.find(m => m.default) || models[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && !(event.target as Element).closest('.model-switcher-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    if (loading || models.length === 0) return null;

    return (
        <div className="relative model-switcher-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/50 border border-white/10 hover:bg-surface hover:border-accent/30 transition-all group"
            >
                <Cpu size={14} className="text-accent opacity-70 group-hover:opacity-100" />
                <span className="text-xs font-medium text-textSecondary group-hover:text-textPrimary">
                    {currentModel?.label || 'Loading...'}
                </span>
                <ChevronDown size={12} className={`text-textSecondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-white/10 rounded-xl shadow-xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 space-y-1">
                        <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-textSecondary font-bold opacity-50">
                            Select Model
                        </div>
                        {models.map(model => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onChange(model.id);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all
                                    ${selectedModelId === model.id || (!selectedModelId && model.default)
                                        ? 'bg-accent/10 text-accent'
                                        : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary'
                                    }
                                `}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{model.label}</span>
                                    <span className="text-[9px] opacity-50 capitalize">{model.provider} • {model.kind}</span>
                                </div>
                                {(selectedModelId === model.id || (!selectedModelId && model.default)) && (
                                    <Check size={14} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
