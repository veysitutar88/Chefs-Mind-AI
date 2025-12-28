import React, { useState } from 'react';
import { ChevronDown, LayoutTemplate } from 'lucide-react';

export interface MediaFormatSelectorProps {
    value: string;
    onChange: (formatId: string) => void;
    isOpen?: boolean;
    onToggle?: () => void;
}

const FORMATS = [
    { id: '1:1', label: 'Square (1:1)' },
    { id: '16:9', label: 'Wide (16:9)' },
    { id: '9:16', label: 'Story (9:16)' },
    { id: '4:5', label: 'Portrait (4:5)' },
    { id: '3:2', label: 'Landscape (3:2)' },
];

export const MediaFormatSelector: React.FC<MediaFormatSelectorProps> = ({ value, onChange, isOpen = false, onToggle }) => {
    // Local state for fallback
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const isDropdownOpen = onToggle ? isOpen : localIsOpen;

    const handleToggle = () => {
        if (onToggle) onToggle();
        else setLocalIsOpen(!localIsOpen);
    };

    const selectedFormat = FORMATS.find(f => f.id === value) || FORMATS[0];

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-borderSoft text-xs text-textPrimary hover:border-accent/50 transition-all min-w-[140px] justify-between hover:shadow-glow hover:bg-slate-900/80"
            >
                <div className="flex items-center gap-2">
                    <LayoutTemplate size={14} className="text-accent" />
                    <span className="font-medium">{selectedFormat.label}</span>
                </div>
                <ChevronDown size={14} className={`text-textSecondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-950 border border-borderSoft rounded-xl shadow-premium overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        {FORMATS.map(format => (
                            <button
                                key={format.id}
                                onClick={() => {
                                    onChange(format.id);
                                    handleToggle();
                                }}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-accent/10 transition-colors ${format.id === value ? 'text-accent font-medium bg-accent/5' : 'text-textSecondary'}`}
                            >
                                {format.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
