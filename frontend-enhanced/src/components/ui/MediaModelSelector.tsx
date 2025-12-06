import React, { useEffect, useState } from 'react';
import { ChevronDown, Sparkles, Lock, Video, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// 1. Define Advanced Models with Metadata
const ADVANCED_MODELS = [
    // Image Models
    {
        id: 'gemini-3-image-pro',
        label: 'Gemini 3 Image Pro',
        description: 'High-fidelity food photography with complex lighting handling.',
        type: 'image',
        strengths: ['Lighting', 'Texture']
    },
    {
        id: 'imagen-4',
        label: 'Imagen 4',
        description: 'Photorealistic generation with precise prompt adherence.',
        type: 'image',
        strengths: ['Realism', 'Details']
    },
    {
        id: 'gpt-image-1',
        label: 'GPT Image 1',
        description: 'Creative composition with strong artistic flair.',
        type: 'image',
        strengths: ['Composition', 'Artistic']
    },
    // Video Models
    {
        id: 'veo-3',
        label: 'Veo 3',
        description: 'Cinematic food video generation.',
        type: 'video',
        strengths: ['Motion', 'Cinematic']
    },
    {
        id: 'veo-3.1',
        label: 'Veo 3.1',
        description: 'Enhanced temporal consistency for longer shots.',
        type: 'video',
        strengths: ['Consistency', 'Smoothness']
    }
];

export interface MediaModelSelectorProps {
    value: string;
    onChange: (value: string) => void;
    type: 'image' | 'video';
    className?: string;
    isOpen?: boolean;
    onToggle?: () => void;
}

export const MediaModelSelector: React.FC<MediaModelSelectorProps> = ({
    value,
    onChange,
    type,
    className,
    isOpen = false,
    onToggle
}) => {
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<boolean>(false);
    // If onToggle is not provided, use local state (backward compatibility)
    const [localIsOpen, setLocalIsOpen] = useState(false);

    // Derived open state
    const isDropdownOpen = onToggle ? isOpen : localIsOpen;
    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setLocalIsOpen(!localIsOpen);
        }
    };

    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            setFetchError(false);
            try {
                // Task 3.1: AbortSignal timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const res = await fetch('/api/media/models', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    setAvailableModels(data.providers?.[type] || []);
                } else {
                    throw new Error("Failed to fetch");
                }
            } catch (error) {
                console.warn("MediaModelSelector: Offline or API error, using fallback.");
                setFetchError(true);
                // Fallback list
                const fallbackIds = ['imagen-4', 'gemini-3-image-pro', 'gpt-image-1', 'veo-3'];
                setAvailableModels(fallbackIds);
            } finally {
                setLoading(false);
            }
        };

        if (type) {
            fetchModels();
        }
    }, [type]);

    const relevantModels = ADVANCED_MODELS.filter(m => m.type === type);
    const selectedModelDef = relevantModels.find(m => m.id === value);
    const selectedLabel = selectedModelDef ? selectedModelDef.label : value;

    return (
        <div className={`relative group/selector ${className || ''}`}>
            <div className="absolute top-0 right-0 -mt-2 -mr-2 z-10 flex gap-1 pointer-events-none">
                {fetchError && <Badge variant="destructive" className="text-[10px] px-1 h-4 scale-75 origin-top-right shadow-sm">Offline</Badge>}
            </div>

            {/* Trigger Button */}
            <button
                onClick={handleToggle}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-borderSoft text-sm text-textPrimary hover:border-accent/50 transition-all w-full justify-between group min-w-[180px]"
                disabled={loading}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {type === 'video' ? <Video size={14} className="text-accent" /> : <Sparkles size={14} className="text-accent" />}
                    <span className="truncate font-medium">
                        {loading ? 'Loading...' : selectedLabel}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-textSecondary transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && !loading && (
                <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-surface border border-borderSoft rounded-xl shadow-premium overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1 max-h-[280px] overflow-y-auto custom-scrollbar">
                        {/* Header for fallback mode */}
                        {fetchError && (
                            <div className="px-3 py-2 text-[10px] text-textSecondary border-b border-white/5 mb-1">
                                Model API offline – using fallback list
                            </div>
                        )}

                        {relevantModels.map(model => {
                            const isConfigured = availableModels.includes(model.id);
                            const isSelected = model.id === value;

                            return (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        if (isConfigured) {
                                            onChange(model.id);
                                            handleToggle();
                                        }
                                    }}
                                    disabled={!isConfigured}
                                    className={`w-full text-left p-3 rounded-lg transition-all border border-transparent
                                        ${isSelected ? 'bg-accent/10 border-accent/20' : 'hover:bg-white/5'}
                                        ${!isConfigured ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-textPrimary'}`}>
                                            {model.label}
                                        </span>
                                        {!isConfigured && <Lock size={12} className="text-textSecondary mt-1" />}
                                    </div>

                                    <p className="text-xs text-textSecondary mb-2 line-clamp-2">
                                        {model.description}
                                    </p>

                                    <div className="flex gap-1 flex-wrap">
                                        {model.strengths.map(s => (
                                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-textSecondary border border-white/5">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}

                        {/* Generic fallback items from API not in our list via availableModels */}
                        {availableModels.filter(id => !relevantModels.find(rm => rm.id === id)).map(id => (
                            <button
                                key={id}
                                onClick={() => { onChange(id); handleToggle(); }}
                                className="w-full text-left p-3 rounded-lg hover:bg-white/5 text-textSecondary text-xs"
                            >
                                {id} (Generic)
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
