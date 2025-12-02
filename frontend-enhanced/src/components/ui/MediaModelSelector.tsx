import React, { useEffect, useState } from 'react';
import { ChevronDown, Sparkles, Lock, Video, Image as ImageIcon } from 'lucide-react';

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

interface MediaModelSelectorProps {
    value: string;
    onChange: (modelId: string) => void;
    type: 'image' | 'video';
}

export const MediaModelSelector: React.FC<MediaModelSelectorProps> = ({ value, onChange, type }) => {
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // 2. Fetch Availability (unchanged logic, just storing IDs)
    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/media/models');
                if (res.ok) {
                    const data = await res.json();
                    // Store the list of enabled provider IDs
                    setAvailableModels(data.providers?.[type] || []);
                }
            } catch (error) {
                console.error('Failed to fetch models', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [type]);

    // 3. Filter and Merge Logic
    const relevantModels = ADVANCED_MODELS.filter(m => m.type === type);

    // Handle case where current value is not in our advanced list (fallback)
    const selectedModelDef = relevantModels.find(m => m.id === value);
    const selectedLabel = selectedModelDef ? selectedModelDef.label : value;

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-borderSoft text-sm text-textPrimary hover:border-accent/50 transition-all w-full justify-between group"
                disabled={loading}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {type === 'video' ? <Video size={14} className="text-accent" /> : <Sparkles size={14} className="text-accent" />}
                    <span className="truncate font-medium">
                        {loading ? 'Loading...' : selectedLabel}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-textSecondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && !loading && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-surface border border-borderSoft rounded-xl shadow-premium overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {relevantModels.map(model => {
                            const isConfigured = availableModels.includes(model.id);
                            const isSelected = model.id === value;

                            return (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        if (isConfigured) {
                                            onChange(model.id);
                                            setIsOpen(false);
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

                        {/* Fallback for models returned by API but not in our advanced list */}
                        {availableModels.filter(id => !relevantModels.find(rm => rm.id === id)).map(id => (
                            <button
                                key={id}
                                onClick={() => { onChange(id); setIsOpen(false); }}
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
