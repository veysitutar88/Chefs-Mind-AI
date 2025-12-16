import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, RefreshCw, X, Image as ImageIcon, Video, WifiOff } from 'lucide-react';
import { MediaJob } from '@/hooks/useMediaGenerator';
import { cn } from '@/lib/utils'; // Assuming this exists, otherwise standard string interpolation

interface MediaJobWidgetProps {
    job: MediaJob;
    onRetry?: () => void;
    onClear?: () => void;
}

export const MediaJobWidget: React.FC<MediaJobWidgetProps> = ({ job, onRetry, onClear }) => {
    const [isFading, setIsFading] = useState(false);

    // Auto-fade triggers
    useEffect(() => {
        if (job.status === 'success') {
            const timer = setTimeout(() => setIsFading(true), 85000); // Start fade before 90s removal
            return () => clearTimeout(timer);
        }
    }, [job.status]);

    const isRetrying = job.status === 'retrying';
    const isOffline = job.isOffline;

    return (
        <div className={`
            bg-surface border border-white/5 rounded-lg p-3 mb-2 
            animate-in slide-in-from-right duration-300
            transition-opacity duration-1000
            ${isFading ? 'opacity-0' : 'opacity-100'}
        `}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {job.type === 'image' ? <ImageIcon size={12} className="text-accent" /> : <Video size={12} className="text-accent" />}
                    <span className="text-xs font-semibold text-textPrimary uppercase tracking-wider">{job.type} Generation</span>
                </div>
                {onClear && (
                    <button onClick={onClear} className="text-textSecondary hover:text-red-400 transition-colors">
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Description */}
            <div className="text-xs text-textSecondary mb-3 truncate font-medium">
                {job.description}
            </div>

            {/* States */}

            {/* Generating / Polling */}
            {(job.status === 'generating' || job.status === 'polling') && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-accent">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs font-medium">Processing...</span>
                    </div>
                    {/* Fake progress bar */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent animate-pulse w-2/3 rounded-full"></div>
                    </div>
                </div>
            )}

            {/* Retrying */}
            {isRetrying && (
                <div className="flex items-center gap-2 text-amber-400 bg-amber-400/5 p-2 rounded">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">Retrying connection ({job.retryCount})...</span>
                </div>
            )}

            {/* Success */}
            {job.status === 'success' && (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/5 p-2 rounded border border-green-400/10">
                    <CheckCircle size={14} />
                    <span className="text-xs font-medium">Complete</span>
                    {job.url && (
                        <div className="ml-auto relative group cursor-pointer">
                            <img src={job.url} alt="Result" className="w-8 h-8 rounded object-cover border border-white/10" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {job.status === 'error' && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-400">
                        {isOffline ? <WifiOff size={14} /> : <AlertCircle size={14} />}
                        <span className="text-xs font-bold">Failed</span>
                    </div>
                    <p className="text-[10px] text-red-300/80 bg-red-500/10 p-2 rounded leading-tight">
                        {job.error}
                    </p>

                    {onRetry && (
                        <button
                            onClick={onRetry}
                            disabled={isOffline}
                            className={`
                                flex items-center justify-center gap-1.5 w-full text-[10px] py-1.5 rounded transition-all
                                ${isOffline
                                    ? 'bg-white/5 text-textSecondary cursor-not-allowed'
                                    : 'bg-white/5 hover:bg-white/10 text-white hover:text-accent'
                                }
                            `}
                        >
                            <RefreshCw size={10} className={isOffline ? '' : 'group-hover:rotate-180 transition-transform'} />
                            Retry Generation
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export const MediaJobWidgetSkeleton = () => (
    <div className="bg-surface border border-white/5 rounded-lg p-3 mb-2 animate-pulse">
        <div className="flex justify-between mb-2">
            <div className="h-3 w-20 bg-white/10 rounded"></div>
            <div className="h-3 w-3 bg-white/10 rounded"></div>
        </div>
        <div className="h-3 w-32 bg-white/5 rounded mb-3"></div>
        <div className="h-8 w-full bg-white/5 rounded"></div>
    </div>
);
