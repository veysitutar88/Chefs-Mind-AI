import React, { useEffect, useState } from 'react';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';

interface Model {
    id: string;
    label?: string;
}

interface MediaModelSelectorProps {
    value: string;
    onChange: (modelId: string) => void;
    type: 'image' | 'video';
}

export const MediaModelSelector: React.FC<MediaModelSelectorProps> = ({ value, onChange, type }) => {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/media/models');
                if (res.ok) {
                    const data = await res.json();
                    // Flatten providers or use specific structure based on API response
                    // Assuming API returns { providers: { image: string[], video: string[] } }
                    const providerList = data.providers?.[type] || [];
                    setModels(providerList.map((p: string) => ({ id: p, label: formatLabel(p) })));
                }
            } catch (error) {
                console.error('Failed to fetch models', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [type]);

    const formatLabel = (id: string) => {
        // Simple formatter, can be enhanced
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const selectedModel = models.find(m => m.id === value) || { id: value, label: formatLabel(value) };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-borderSoft text-xs text-textPrimary hover:border-accent/50 transition-all min-w-[140px] justify-between"
                disabled={loading}
            >
                <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-accent" />
                    <span className="truncate max-w-[100px]">{loading ? 'Loading...' : selectedModel.label}</span>
                </div>
                <ChevronDown size={12} className={`text-textSecondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !loading && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-surface border border-borderSoft rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {models.map(model => (
                        <button
                            key={model.id}
                            onClick={() => {
                                onChange(model.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-accent/10 transition-colors ${model.id === value ? 'text-accent font-medium bg-accent/5' : 'text-textSecondary'}`}
                        >
                            {model.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
