import React, { useState } from 'react';
import { ChevronDown, LayoutTemplate } from 'lucide-react';

interface MediaFormatSelectorProps {
    value: string;
    onChange: (formatId: string) => void;
}

const FORMATS = [
    { id: '1:1', label: 'Square (1:1)' },
    { id: '16:9', label: 'Wide (16:9)' },
    { id: '9:16', label: 'Story (9:16)' },
    { id: '4:5', label: 'Portrait (4:5)' },
    { id: '3:2', label: 'Landscape (3:2)' },
];

export const MediaFormatSelector: React.FC<MediaFormatSelectorProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedFormat = FORMATS.find(f => f.id === value) || FORMATS[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-borderSoft text-xs text-textPrimary hover:border-accent/50 transition-all min-w-[120px] justify-between"
            >
                <div className="flex items-center gap-2">
                    <LayoutTemplate size={12} className="text-accent" />
                    <span>{selectedFormat.label}</span>
                </div>
                <ChevronDown size={12} className={`text-textSecondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-surface border border-borderSoft rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {FORMATS.map(format => (
                        <button
                            key={format.id}
                            onClick={() => {
                                onChange(format.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-accent/10 transition-colors ${format.id === value ? 'text-accent font-medium bg-accent/5' : 'text-textSecondary'}`}
                        >
                            {format.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
