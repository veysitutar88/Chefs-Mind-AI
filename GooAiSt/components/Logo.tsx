import React from 'react';
import { ChefHat, Brain } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", iconOnly = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center w-10 h-10 bg-accent/10 rounded-xl border border-accent/20 shadow-glow">
        {/* Combining generic icons to represent Chef + Brain loosely based on description */}
        <ChefHat className="text-accent absolute -top-1" size={20} strokeWidth={2.5} />
        <Brain className="text-accentSoft absolute top-3" size={16} strokeWidth={2} />
      </div>
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white leading-none">
            Chef's <span className="text-accent">Mind</span> AI
          </span>
          <span className="text-[10px] uppercase tracking-widest text-textSecondary mt-1">
            Culinary Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
