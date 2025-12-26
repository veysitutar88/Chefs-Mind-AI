import React, { useState, useRef, useEffect } from 'react';
import { AgentConfig, Message } from '@/types/ui';
import { Send, Image as ImageIcon, Video, Grid, Loader2, Paperclip, Bot } from 'lucide-react';
import { Logo } from './Logo';
import { MediaModelSelector } from './MediaModelSelector';
import { MediaFormatSelector } from './MediaFormatSelector';
import { UpscaleButton } from './UpscaleButton';
import { ModelSwitcher } from './ModelSwitcher';
import { QualitySelector } from './QualitySelector';
import { SeedInput } from './SeedInput';
import { StepsInput } from './StepsInput';

interface ChatAreaProps {
    activeAgent: AgentConfig;
    messages: Message[];
    onSendMessage: (text: string) => void;
    isLoading: boolean;
    onMediaAction?: (action: 'image' | 'video' | 'gallery') => void;
    // Media Props
    mediaOptions?: {
        model: string;
        format: string;
        quality: 'standard' | 'hd' | 'premium';
        seed: number | null;
        steps: number;
        lastImage?: string | null;
    };
    onMediaOptionChange?: (key: 'model' | 'format' | 'quality' | 'seed' | 'steps', value: string | number | null) => void;
    onUpscaleComplete?: (url: string) => void;
    // Model Switcher Props
    selectedModelId?: string | null;
    onModelChange?: (modelId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    activeAgent,
    messages,
    onSendMessage,
    isLoading,
    onMediaAction,
    mediaOptions,
    onMediaOptionChange,
    onUpscaleComplete,
    selectedModelId,
    onModelChange
}) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim() && !isLoading) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    const isMediaAgent = activeAgent.id === 'foodframe';

    const [activeDropdown, setActiveDropdown] = useState<'model' | 'format' | 'quality' | null>(null);

    const toggleDropdown = (name: 'model' | 'format' | 'quality') => {
        setActiveDropdown(prev => prev === name ? null : name);
    };

    const closeDropdowns = () => setActiveDropdown(null);

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border border-white/5 overflow-hidden shadow-2xl relative">

            {/* Task 1.3: Backdrop for closing dropdowns */}
            {activeDropdown && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={closeDropdowns}
                    aria-label="Close dropdowns"
                />
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex items-center px-6 z-10 justify-between">
                <div className="flex items-center gap-3">
                    <Logo iconOnly className="opacity-50 scale-75 hover:opacity-100 transition-opacity" />
                    <div>
                        <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                            {activeAgent.title}
                            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#4BC9FF] animate-pulse"></div>
                        </h2>
                        <p className="text-xs text-textSecondary">{activeAgent.subtitle}</p>
                    </div>
                </div>

                {/* Model Switcher */}
                {onModelChange && (
                    <ModelSwitcher
                        agentKey={activeAgent.id as any}
                        selectedModelId={selectedModelId || null}
                        onChange={onModelChange}
                    />
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 pt-24 pb-32 space-y-6 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <Bot size={64} className="text-accent mb-4" />
                        <p className="text-textSecondary text-lg">Start a conversation with {activeAgent.title}</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-200 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] p-4 rounded-2xl relative group shadow-sm transition-all ${msg.role === 'user'
                            ? 'bg-accent/10 border border-accent/20 text-textPrimary rounded-tr-sm hover:bg-accent/15'
                            : 'bg-surface border border-white/5 text-textSecondary rounded-tl-sm hover:bg-surface/80'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            <span className="text-[10px] opacity-40 mt-2 block text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div
                        className="flex justify-start w-full"
                        style={{
                            opacity: 0,
                            transform: 'translateY(10px)',
                            animation: 'fadeIn 0.2s forwards'
                        }}
                    >
                        <div className="bg-surface border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                            <Loader2 className="animate-spin text-accent" size={18} />
                            <span className="text-sm text-textSecondary">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-6">

                {/* Media Actions for FoodFrame */}
                {isMediaAgent && (
                    <div className="flex flex-col gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-50">
                        {/* Advanced Controls Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <MediaModelSelector
                                value={mediaOptions?.model || ''}
                                onChange={(val) => onMediaOptionChange?.('model', val)}
                                type="image"
                                isOpen={activeDropdown === 'model'}
                                onToggle={() => toggleDropdown('model')}
                            />
                            <MediaFormatSelector
                                value={mediaOptions?.format || ''}
                                onChange={(val) => onMediaOptionChange?.('format', val)}
                                isOpen={activeDropdown === 'format'}
                                onToggle={() => toggleDropdown('format')}
                            />
                            <QualitySelector
                                value={mediaOptions?.quality || 'standard'}
                                onChange={(val) => onMediaOptionChange?.('quality', val)}
                                isOpen={activeDropdown === 'quality'}
                                onToggle={() => toggleDropdown('quality')}
                            />
                            <UpscaleButton
                                lastImage={mediaOptions?.lastImage}
                                onUpscaleComplete={onUpscaleComplete}
                            />
                        </div>

                        {/* Additional Controls Row */}
                        <div className="flex items-center gap-4">
                            <SeedInput
                                value={mediaOptions?.seed || null}
                                onChange={(val) => onMediaOptionChange?.('seed', val)}
                            />
                            <StepsInput
                                value={mediaOptions?.steps || 30}
                                onChange={(val) => onMediaOptionChange?.('steps', val)}
                            />
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => onMediaAction?.('image')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-accent/30 text-accent text-sm hover:bg-accent hover:text-white transition-all hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ImageIcon size={16} /> Generate Image
                            </button>
                            <button
                                onClick={() => onMediaAction?.('video')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-accent/30 text-accent text-sm hover:bg-accent hover:text-white transition-all hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Video size={16} /> Generate Video
                            </button>
                            <button
                                onClick={() => onMediaAction?.('gallery')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-white/10 text-textSecondary text-sm hover:text-textPrimary hover:border-white/20 transition-all hover:bg-white/5"
                            >
                                <Grid size={16} /> View Gallery
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Box */}
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Message ${activeAgent.title}...`}
                            className="w-full bg-surface border border-white/10 text-textPrimary rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:border-accent/50 focus:shadow-glow transition-all placeholder:text-textSecondary/50 hover:border-white/20"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-accent transition-colors p-2 hover:bg-white/5 rounded-lg"
                        >
                            <Paperclip size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        className={`
              p-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center
              ${!inputText.trim() || isLoading
                                ? 'bg-surface text-textSecondary cursor-not-allowed border border-white/5'
                                : 'bg-accent text-white shadow-glow hover:shadow-glow-active hover:scale-105 active:scale-95'
                            }
            `}
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-center text-[10px] text-textSecondary mt-3 opacity-50">
                    AI generated content may be inaccurate. Check important info.
                </p>
            </div>
        </div>
    );
};
