'use client';

import React, { useState } from 'react';
import { ChatArea } from '../ui/ChatArea';
import { AgentConfig, Message } from '@/types/ui';
import { AGENT_CANON } from '@/config/agents';

export function FoodFrameStudio() {
    // 1. Agent Config
    const agent = AGENT_CANON.foodframe;
    const activeAgent: AgentConfig = {
        id: agent.id,
        title: agent.label,
        subtitle: agent.subtitle,
        iconName: agent.iconName,
        icon: agent.icon,
    };

    // 2. Chat State
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'system',
            text: 'Studio Session Active',
            timestamp: Date.now(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // 3. Media State
    const [mediaOptions, setMediaOptions] = useState({
        model: 'imagen-4',
        format: '1:1',
        quality: 'standard' as const,
        seed: null as number | null,
        steps: 30,
        lastImage: null as string | null,
    });

    // 4. Handlers
    const handleSendMessage = async (text: string) => {
        // Optimistic User Msg
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Echo / API Stub
            const response = await fetch('/api/enhanced-agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    agentId: 'foodframe',
                    mediaOptions // Pass media context if backend supports it
                }),
            });

            if (!response.ok) throw new Error('API Failed');
            const data = await response.json();

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: data.response || 'Generating media...',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, agentMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                text: 'Connection error. Please try again.',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMediaOptionChange = (key: string, value: any) => {
        setMediaOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleUpscaleComplete = (url: string) => {
        setMediaOptions(prev => ({ ...prev, lastImage: url }));
    };

    const handleMediaAction = (action: 'image' | 'video' | 'gallery') => {
        console.log('[Studio] Media Action:', action);
    };

    return (
        <ChatArea
            activeAgent={activeAgent}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            mediaOptions={mediaOptions}
            onMediaOptionChange={handleMediaOptionChange}
            onUpscaleComplete={handleUpscaleComplete}
            onMediaAction={handleMediaAction}
        />
    );
}
