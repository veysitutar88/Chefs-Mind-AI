'use client';

import React from 'react';

interface MediaThumbnailProps {
    url: string | null;
    type: 'image' | 'video';
    prompt: string;
    createdAt: string;
}

export function MediaThumbnail({ url, type, prompt, createdAt }: MediaThumbnailProps) {
    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="flex items-start gap-3 px-3 py-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
            {/* Thumbnail Preview */}
            <div className="relative w-12 h-12 flex-shrink-0 bg-slate-700 rounded overflow-hidden">
                {url && type === 'image' ? (
                    <img
                        src={url}
                        alt={prompt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        {type === 'image' ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-slate-900/80 rounded text-[10px] text-slate-300 font-medium">
                    {type}
                </div>
            </div>

            {/* Media Info */}
            <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-300 truncate" title={prompt}>
                    {prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                    {formattedDate}
                </div>
            </div>
        </div>
    );
}
