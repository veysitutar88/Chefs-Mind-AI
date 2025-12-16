import React from 'react';
import { Camera, Utensils, Zap, Sun, Palette } from 'lucide-react';

export interface MediaPreset {
    id: string;
    label: string;
    description: string;
    modelId: string; // The preferred model for this preset
    params: {
        aspectRatio: string;
        detailLevel?: 'low' | 'medium' | 'high';
        styleHints: string[];
    };
    icon: React.ElementType;
}

const PRESETS: MediaPreset[] = [
    {
        id: 'michelin-star',
        label: 'Michelin Star Plating',
        description: 'Precision plating, macro details, elegant lighting.',
        modelId: 'imagen-4',
        params: {
            aspectRatio: '1:1',
            detailLevel: 'high',
            styleHints: ['macro', 'elegant', 'fine dining', 'studio lighting']
        },
        icon: Utensils
    },
    {
        id: 'rustic-bistro',
        label: 'Rustic Bistro Table',
        description: 'Warm tones, wood textures, cozy atmosphere.',
        modelId: 'gemini-3-image-pro',
        params: {
            aspectRatio: '4:5',
            detailLevel: 'medium',
            styleHints: ['warm', 'rustic', 'wood', 'bokeh']
        },
        icon: Camera
    },
    {
        id: 'dark-food-navi',
        label: "Dark Food – Na'Vi Blue",
        description: 'Moody dark background with striking blue accents.',
        modelId: 'gpt-image-1',
        params: {
            aspectRatio: '16:9',
            detailLevel: 'high',
            styleHints: ['dark mode', 'blue accent', 'moody', 'contrast']
        },
        icon: Zap
    },
    {
        id: 'bright-social',
        label: 'Bright Daylight Social',
        description: 'High key, natural sunlight, vibrant colors.',
        modelId: 'imagen-4',
        params: {
            aspectRatio: '9:16',
            detailLevel: 'medium',
            styleHints: ['natural light', 'bright', 'vibrant', 'social media']
        },
        icon: Sun
    },
    {
        id: 'dark-food-premium',
        label: 'Dark Food Premium',
        description: 'Low-key fine dining: deep blacks, warm directional light, dramatic shadows.',
        modelId: 'gemini-3-image-pro',
        params: {
            aspectRatio: '4:5',
            detailLevel: 'high',
            styleHints: [
                'low-key', 'dark background', 'warm light',
                'dramatic shadows', 'micro-contrast', 'fine dining plating',
                'textured highlights'
            ]
        },
        icon: Zap
    },
    {
        id: 'navi-blue-signature',
        label: "Na'Vi Blue Accent",
        description: "Signature June Six style: dark moody scene with soft Na'Vi blue highlights.",
        modelId: 'gpt-image-1',
        params: {
            aspectRatio: '4:5',
            detailLevel: 'high',
            styleHints: [
                'moody dark', "Na'Vi blue accent",
                'soft rimlight', 'fine edges glow',
                'premium dramatic aesthetic'
            ]
        },
        icon: Palette
    },
    {
        id: 'fine-dining-macro-dark',
        label: 'Fine Dining Macro (Dark)',
        description: 'Macro plating shots with soft spot-light and dramatic depth.',
        modelId: 'imagen-4',
        params: {
            aspectRatio: '1:1',
            detailLevel: 'high',
            styleHints: [
                'macro', 'shallow depth', 'soft top-light',
                'fine textures', 'precise plating', 'minimalist frame'
            ]
        },
        icon: Utensils
    },
    {
        id: 'rustic-night',
        label: 'Rustic Warm Night',
        description: 'Warm evening lighting on wood textures – cozy, cinematic atmosphere.',
        modelId: 'gemini-3-image-pro',
        params: {
            aspectRatio: '4:5',
            detailLevel: 'medium',
            styleHints: [
                'warm light', 'wood table', 'soft shadow falloff',
                'rustic bistro', 'cozy night ambience'
            ]
        },
        icon: Camera
    },
    {
        id: 'overhead-clean',
        label: 'Overhead Minimalist',
        description: 'Clean overhead angle, minimal props, balanced soft light.',
        modelId: 'imagen-4',
        params: {
            aspectRatio: '4:5',
            detailLevel: 'high',
            styleHints: [
                'overhead', 'soft shadow', 'minimalist composition',
                'plate symmetry', 'fine dining presentation'
            ]
        },
        icon: Sun
    },
    {
        id: 'bar-amber',
        label: 'Bar Amber Night',
        description: 'Warm amber bar light with dark textured background.',
        modelId: 'gpt-image-1',
        params: {
            aspectRatio: '4:5',
            detailLevel: 'medium',
            styleHints: [
                'amber warm light', 'dark bar backdrop',
                'high contrast', 'evening atmosphere'
            ]
        },
        icon: Zap
    }
];

interface MediaPresetSelectorProps {
    onSelect: (preset: MediaPreset) => void;
    activePresetId?: string;
    className?: string;
}

export const MediaPresetSelector: React.FC<MediaPresetSelectorProps> = ({ onSelect, activePresetId, className = '' }) => {
    return (
        <div className={`grid grid-cols-2 gap-2 ${className}`}>
            {PRESETS.map((preset) => {
                const isActive = activePresetId === preset.id;
                const Icon = preset.icon;

                return (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(preset)}
                        className={`
                            relative flex flex-col items-start p-3 rounded-xl border transition-all duration-200 text-left
                            ${isActive
                                ? 'bg-accent/10 border-accent text-accent'
                                : 'bg-surface border-borderSoft text-textSecondary hover:border-accent/50 hover:text-textPrimary'
                            }
                        `}
                    >
                        <div className={`mb-2 p-1.5 rounded-lg ${isActive ? 'bg-accent/20' : 'bg-white/5'}`}>
                            <Icon size={16} />
                        </div>
                        <span className="text-xs font-semibold mb-0.5">{preset.label}</span>
                        <span className="text-[10px] opacity-70 leading-tight">{preset.description}</span>
                    </button>
                );
            })}
        </div>
    );
};
