import React, { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';

interface UpscaleButtonProps {
    lastImage?: string | null;
    onUpscaleComplete?: (newUrl: string) => void;
}

export const UpscaleButton: React.FC<UpscaleButtonProps> = ({ lastImage, onUpscaleComplete }) => {
    const [loading, setLoading] = useState(false);

    const handleUpscale = async () => {
        if (!lastImage) return;

        setLoading(true);
        try {
            const res = await fetch('/api/media/upscale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: lastImage, agent: 'foodframe', scale: '2x' })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url && onUpscaleComplete) {
                    onUpscaleComplete(data.url);
                }
                // If mock/not implemented, we might just alert or log
                if (res.status === 501) {
                    alert("Upscale feature coming soon (Backend 501)");
                }
            } else {
                console.error("Upscale failed");
            }
        } catch (error) {
            console.error("Upscale error", error);
        } finally {
            setLoading(false);
        }
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
