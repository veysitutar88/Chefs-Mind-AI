'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — ChatArea
   Center column: Agent header + messages + input
   ========================================================= */

import React, { useRef, useEffect, useState } from 'react';
import { AgentConfig, Message } from '@/types/ui';
import { TEXT_MODELS, TextModelId } from '@/constants/ui';

/* ---------------------------------------------------------
   ChatArea Props
--------------------------------------------------------- */
interface ChatAreaProps {
  activeAgent: AgentConfig;
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  selectedModelId: string | null;
  onModelChange: (modelId: string) => void;
}

/* ---------------------------------------------------------
   ChatArea
--------------------------------------------------------- */
export function ChatArea({
  activeAgent,
  messages,
  onSendMessage,
  isLoading,
  selectedModelId,
  onModelChange,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [inputText]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-root)' }}>

      {/* ── Agent Header ── */}
      <header
        className="flex items-center justify-between px-6"
        style={{ height: 64, borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="agent-icon agent-icon--md"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)' }}
          >
            <span style={{ fontSize: 18 }}>{activeAgent.icon}</span>
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {activeAgent.label}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {activeAgent.subtitle}
            </div>
          </div>
        </div>

        {/* Model selector */}
        <ModelSelector
          selectedModelId={(selectedModelId || 'auto') as TextModelId}
          onChange={onModelChange}
        />
      </header>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isEmpty ? (
          <EmptyState agent={activeAgent} />
        ) : (
          <>
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} agentIcon={activeAgent.icon} />
            ))}
            {isLoading && <TypingIndicator agentIcon={activeAgent.icon} />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div
        className="px-6 py-4"
        style={{ borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl p-3"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            transition: 'border-color 200ms ease, box-shadow 200ms ease',
          }}
          onFocus={() => {}}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeAgent.label}…`}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
            style={{
              color: 'var(--text-primary)',
              minHeight: 36,
              maxHeight: 160,
              fontFamily: 'inherit',
            }}
          />

          {/* Attach button */}
          <button
            className="flex-shrink-0 flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 36,
              height: 36,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
            title="Attach file"
          >
            <PaperclipIcon />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 36,
              height: 36,
              background: inputText.trim() && !isLoading ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
              border: '1px solid transparent',
              color: inputText.trim() && !isLoading ? '#fff' : 'var(--text-disabled)',
              boxShadow: inputText.trim() && !isLoading ? '0 0 16px var(--accent-glow)' : 'none',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
            }}
            title="Send (Enter)"
          >
            {isLoading ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center">
          <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
            Enter to send · Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ChatMessage
--------------------------------------------------------- */
function ChatMessage({ message, agentIcon }: { message: Message; agentIcon: string }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div
          className="message-bubble--system px-4 py-2 text-xs max-w-md text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div
          className="agent-icon agent-icon--sm flex-shrink-0"
          style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', marginBottom: 2 }}
        >
          <span style={{ fontSize: 13 }}>{agentIcon}</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {/* Image result */}
        {message.mediaUrl && message.mediaType === 'image' && (
          <img
            src={message.mediaUrl}
            alt="Generated"
            className="rounded-xl mb-2 max-w-full"
            style={{ maxHeight: 300, objectFit: 'cover' }}
          />
        )}
        {message.text}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   EmptyState — shown when no messages
--------------------------------------------------------- */
function EmptyState({ agent }: { agent: AgentConfig }) {
  const suggestions: Record<string, string[]> = {
    souschef:    ['Create a recipe for sea bass', 'Suggest a plating technique', 'Prep schedule for 40 covers'],
    gastrocount: ['Calculate food cost for tonight', 'Inventory status', 'Generate weekly cost report'],
    gastromind:  ['Latest food trends 2025', 'Competitor analysis', 'Seasonal ingredient insights'],
    foodframe:   ['Generate a hero dish photo', 'Create a menu visual', 'Style a social media post'],
  };

  const prompts = suggestions[agent.id] || [];

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center animate-fade-in">
      <div
        className="agent-icon agent-icon--lg mb-5"
        style={{
          background: 'var(--accent-subtle)',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 0 32px var(--accent-glow)',
        }}
      >
        <span style={{ fontSize: 28 }}>{agent.icon}</span>
      </div>

      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {agent.label}
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        {agent.subtitle}
      </p>

      {prompts.length > 0 && (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {prompts.map((prompt, i) => (
            <button
              key={i}
              className="px-4 py-3 rounded-xl text-sm text-left transition-all group relative"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)',
                color: 'var(--text-muted)',
              }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
              />
              <span className="relative z-10">{prompt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Typing Indicator
--------------------------------------------------------- */
function TypingIndicator({ agentIcon }: { agentIcon: string }) {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div
        className="agent-icon agent-icon--sm flex-shrink-0"
        style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', marginBottom: 2 }}
      >
        <span style={{ fontSize: 13 }}>{agentIcon}</span>
      </div>
      <div
        className="message-bubble--assistant px-4 py-3 flex items-center gap-1.5"
        style={{ minHeight: 42 }}
      >
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Model Selector (chat header)
--------------------------------------------------------- */
function ModelSelector({ selectedModelId, onChange }: {
  selectedModelId: TextModelId;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = TEXT_MODELS.find(m => m.id === selectedModelId) || TEXT_MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border-soft)',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        <span>{selected.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-20 popover-canon"
            style={{ minWidth: 180 }}
          >
            {TEXT_MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => { onChange(model.id); setOpen(false); }}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group relative"
              >
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
                />
                <div className="relative z-10">
                  <div
                    className="text-sm font-medium"
                    style={{ color: selectedModelId === model.id ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {model.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                    {model.description}
                  </div>
                </div>
                {selectedModelId === model.id && (
                  <div
                    className="ml-auto flex-shrink-0 relative z-10"
                    style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--accent)', marginTop: 6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Icons
--------------------------------------------------------- */
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
