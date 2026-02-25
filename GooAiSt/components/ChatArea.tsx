import React, { useState, useRef, useEffect } from 'react';
import { Message, AgentConfig } from '../types';
import { Send, Image as ImageIcon, Video, Grid, Loader2, Paperclip, Bot } from 'lucide-react';
import { Logo } from './Logo';

interface ChatAreaProps {
  activeAgent: AgentConfig;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onMediaAction?: (action: 'image' | 'video' | 'gallery') => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  activeAgent, 
  messages, 
  onSendMessage, 
  isLoading,
  onMediaAction 
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

  const isMediaAgent = activeAgent.id === 'food_frame';

  return (
    <div className="flex flex-col h-full bg-[#0D121F] rounded-[24px] border border-borderSoft overflow-hidden shadow-2xl relative">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-surface/80 backdrop-blur-md border-b border-borderSoft flex items-center px-6 z-10 justify-between">
        <div className="flex items-center gap-3">
          <Logo iconOnly className="opacity-30 scale-75" />
          <div>
            <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
              {activeAgent.title}
              <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#3EAFFF] animate-pulse"></div>
            </h2>
            <p className="text-xs text-textSecondary">{activeAgent.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 pt-24 pb-32 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <Bot size={64} className="text-accent mb-4" />
            <p className="text-textSecondary text-lg">Start a conversation with {activeAgent.title}</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[70%] p-4 rounded-2xl relative group
              ${msg.role === 'user' 
                ? 'bg-accent/10 border border-accent/20 text-textPrimary rounded-tr-sm' 
                : 'bg-surface border border-borderSoft text-textSecondary rounded-tl-sm shadow-sm'
              }
            `}>
               <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
               <span className="text-[10px] opacity-40 mt-2 block text-right">
                 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="bg-surface border border-borderSoft p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
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
          <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <button 
               onClick={() => onMediaAction?.('image')}
               className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-accent/30 text-accent text-sm hover:bg-accent hover:text-white transition-all hover:shadow-glow"
             >
               <ImageIcon size={16} /> Generate Image
             </button>
             <button 
               onClick={() => onMediaAction?.('video')}
               className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-accent/30 text-accent text-sm hover:bg-accent hover:text-white transition-all hover:shadow-glow"
             >
               <Video size={16} /> Generate Video
             </button>
             <button 
               onClick={() => onMediaAction?.('gallery')}
               className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-borderSoft text-textSecondary text-sm hover:text-textPrimary hover:border-textPrimary transition-all"
             >
               <Grid size={16} /> View Gallery
             </button>
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
              className="w-full bg-surface border border-borderSoft text-textPrimary rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-accent focus:shadow-glow transition-all placeholder:text-textSecondary/50"
              disabled={isLoading}
            />
            <button 
              type="button" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-accent transition-colors"
            >
              <Paperclip size={20} />
            </button>
          </div>
          <button 
            type="submit" 
            disabled={!inputText.trim() || isLoading}
            className={`
              p-4 rounded-full transition-all duration-300 shadow-lg
              ${!inputText.trim() || isLoading 
                ? 'bg-surface text-textSecondary cursor-not-allowed border border-borderSoft' 
                : 'bg-accent text-white shadow-glow hover:scale-105 active:scale-95'
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
