import React, { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';

interface UpscaleButtonProps {
    lastImage?: string | null;
    onUpscaleComplete?: (newUrl: string) => void;
}

export const UpscaleButton: React.FC<UpscaleButtonProps> = ({ lastImage, onUpscaleComplete }) => {
    const [loading, setLoading] = useState(false);

    const handleUpscale = () => {
        if (!lastImage) return;
        // Stub for now as requested
        alert("Upscale endpoint not connected yet.");
    };

    return (
        <button
            onClick={handleUpscale}
            disabled={!lastImage || loading}
            className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all
        ${!lastImage || loading
                    ? 'bg-surface border-borderSoft text-textSecondary opacity-50 cursor-not-allowed'
                    : 'bg-surface border-accent/30 text-accent hover:bg-accent hover:text-white hover:shadow-glow'
                }
      `}
            title={!lastImage ? "Generate an image first" : "Upscale 2x"}
        >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            <span>Upscale</span>
        </button>
    );
};
