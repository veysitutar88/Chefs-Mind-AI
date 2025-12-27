import React from 'react';

interface ChatShellProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * A unified "shell" for chat interfaces, ensuring consistent premium dark/glass styling
 * across Universal Chat and Agent Chat views.
 */
export const ChatShell: React.FC<ChatShellProps> = ({ children, className = '' }) => {
    return (
        <div
            className={`
        flex flex-col h-full 
        bg-slate-950/80 backdrop-blur-xl 
        rounded-2xl 
        border-4 border-red-600 relative
        overflow-hidden 
        shadow-2xl 
        ${className}
      `}
        >
            <div className="absolute top-0 left-0 bg-red-600 text-white font-bold px-4 py-2 z-50 pointer-events-none">
                DEBUG ACTIVE 2025-12-27 00:45
            </div>
            {children}
        </div>
    );
};
