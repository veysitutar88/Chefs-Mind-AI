import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export interface QualitySelectorProps {
  value: 'standard' | 'hd' | 'premium';
  onChange: (quality: 'standard' | 'hd' | 'premium') => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const QUALITY_OPTIONS = [
  { id: 'standard', label: 'Standard', description: 'Good quality' },
  { id: 'hd', label: 'HD', description: 'High definition' },
  { id: 'premium', label: 'Premium', description: 'Highest quality' },
];

export const QualitySelector: React.FC<QualitySelectorProps> = ({ value, onChange, isOpen = false, onToggle }) => {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isDropdownOpen = onToggle ? isOpen : localIsOpen;

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setLocalIsOpen(!localIsOpen);
  };

  const selectedQuality = QUALITY_OPTIONS.find(q => q.id === value) || QUALITY_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-borderSoft text-xs text-textPrimary hover:border-accent/50 transition-all min-w-[120px] justify-between"
        disabled={false}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-accent" />
          <span>{selectedQuality.label}</span>
        </div>
        <ChevronDown size={12} className={`text-textSecondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-surface border border-borderSoft rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {QUALITY_OPTIONS.map(quality => (
            <button
              key={quality.id}
              onClick={() => {
                onChange(quality.id as 'standard' | 'hd' | 'premium');
                handleToggle();
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-accent/10 transition-colors ${quality.id === value ? 'text-accent font-medium bg-accent/5' : 'text-textSecondary'}`}
            >
              <div className="font-medium">{quality.label}</div>
              <div className="text-[10px] opacity-70">{quality.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};