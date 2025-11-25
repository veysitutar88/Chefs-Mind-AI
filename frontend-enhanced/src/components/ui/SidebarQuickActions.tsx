import React, { useState } from 'react';
import { Wand2, CheckCircle2, Languages, Zap, ArrowRight } from 'lucide-react';
import { Button } from './button';

interface QuickActionResponse {
    original: string;
    rewritten?: string;
    fixed?: string;
    translated?: string;
    optimized?: string;
    suggestions?: string[];
    corrections?: any[];
    sourceLang?: string;
    targetLang?: string;
    improvements?: string[];
}

interface SidebarQuickActionsProps {
    className?: string;
}

export const SidebarQuickActions: React.FC<SidebarQuickActionsProps> = ({ className }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState<string | null>(null);
    const [targetLang, setTargetLang] = useState('es');

    const handleAction = async (action: 'rewrite' | 'fix' | 'translate' | 'optimize') => {
        if (!text.trim()) return;
        
        setLoading(action);
        
        try {
            // TODO: Replace with actual API call when backend endpoints are available
            // POST /api/sidebar/quick/${action}
            
            // Mock response for now
            await new Promise(resolve => setTimeout(resolve, 800));
            
            let result = text;
            switch (action) {
                case 'rewrite':
                    result = `[Rewritten] ${text}`;
                    break;
                case 'fix':
                    result = `[Fixed] ${text}`;
                    break;
                case 'translate':
                    result = `[${targetLang.toUpperCase()}] ${text}`;
                    break;
                case 'optimize':
                    result = `[Optimized] ${text}`;
                    break;
            }
            
            setText(result);
        } catch (error) {
            console.error(`Quick action ${action} failed:`, error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="p-4 pb-2">
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                    <Zap size={16} className="text-accent" />
                    Quick Actions
                </h3>
            </div>

            <div className="flex-1 flex flex-col p-4 pt-0 space-y-4 min-h-0">
                <div className="flex-1 relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to process..."
                        className="w-full h-full bg-background/30 border border-white/10 rounded-xl p-3 text-xs text-textPrimary focus:outline-none focus:border-accent/50 resize-none custom-scrollbar placeholder:text-textSecondary/50"
                    />
                    {text && (
                        <button 
                            onClick={() => setText('')}
                            className="absolute top-2 right-2 text-textSecondary hover:text-textPrimary text-[10px] bg-black/20 px-1.5 py-0.5 rounded"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('rewrite')}
                        disabled={!!loading || !text.trim()}
                        className="justify-start h-8 text-[10px] border-white/10 hover:bg-white/5 hover:text-accent"
                    >
                        <Wand2 size={12} className="mr-2" />
                        {loading === 'rewrite' ? 'Rewriting...' : 'Rewrite'}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('fix')}
                        disabled={!!loading || !text.trim()}
                        className="justify-start h-8 text-[10px] border-white/10 hover:bg-white/5 hover:text-green-400"
                    >
                        <CheckCircle2 size={12} className="mr-2" />
                        {loading === 'fix' ? 'Fixing...' : 'Fix Grammar'}
                    </Button>

                    <div className="col-span-2 flex gap-2">
                        <select
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="w-16 bg-background/30 border border-white/10 rounded-md text-[10px] text-textPrimary px-1 focus:outline-none focus:border-accent/50"
                        >
                            <option value="en">EN</option>
                            <option value="es">ES</option>
                            <option value="fr">FR</option>
                            <option value="de">DE</option>
                            <option value="it">IT</option>
                            <option value="ru">RU</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('translate')}
                            disabled={!!loading || !text.trim()}
                            className="flex-1 justify-start h-8 text-[10px] border-white/10 hover:bg-white/5 hover:text-blue-400"
                        >
                            <Languages size={12} className="mr-2" />
                            {loading === 'translate' ? 'Translating...' : 'Translate'}
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('optimize')}
                        disabled={!!loading || !text.trim()}
                        className="col-span-2 justify-start h-8 text-[10px] border-white/10 hover:bg-white/5 hover:text-purple-400"
                    >
                        <ArrowRight size={12} className="mr-2" />
                        {loading === 'optimize' ? 'Optimizing...' : 'Optimize'}
                    </Button>
                </div>
            </div>
        </div>
    );
};