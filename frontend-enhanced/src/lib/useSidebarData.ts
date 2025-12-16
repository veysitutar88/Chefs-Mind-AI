'use client';

import { useState, useEffect } from 'react';

// Types
interface MediaAsset {
    id: string;
    userId: string;
    provider: string;
    prompt: string;
    status: string;
    assetUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ChatSession {
    id: string;
    userId: string;
    agentType: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
    messageCount?: number;
}

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime: string } | { date: string };
    end: { dateTime: string } | { date: string };
    location?: string;
}

interface MediaData {
    items: MediaAsset[];
    loading: boolean;
    error: string | null;
}

interface ChatData {
    sessions: ChatSession[];
    loading: boolean;
    error: string | null;
}

interface CalendarData {
    events: CalendarEvent[];
    loading: boolean;
    error: string | null;
}

export interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string; // ISO string
    assignee?: string;
}

interface FollowupData {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

export interface SidebarData {
    media: MediaData;
    chats: ChatData;
    calendar: CalendarData;
    followups: FollowupData;
    refresh: () => void;

    // Flat Follow-up tasks API (Block 8)
    tasks: Task[];
    loading: boolean;
    error: string | null;
    refetchTasks: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5003';

export function useSidebarData(): SidebarData {
    // Media state
    const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
    const [mediaLoading, setMediaLoading] = useState(true);
    const [mediaError, setMediaError] = useState<string | null>(null);

    // Chat state
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [chatLoading, setChatLoading] = useState(true);
    const [chatError, setChatError] = useState<string | null>(null);

    // Calendar state
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(true);
    const [calendarError, setCalendarError] = useState<string | null>(null);

    // Follow-up Tasks state (Block 8)
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState<string | null>(null);

    // Fetch media assets
    const fetchMedia = async () => {
        setMediaLoading(true);
        setMediaError(null);

        try {
            const response = await fetch(`${API_BASE}/api/media/assets?limit=10&offset=0`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch media: ${response.status}`);
            }

            const data = await response.json();
            setMediaItems(data.assets || []);
        } catch (error) {
            console.error('Media fetch error:', error);
            setMediaError(error instanceof Error ? error.message : 'Unknown error');
            setMediaItems([]);
        } finally {
            setMediaLoading(false);
        }
    };

    // Fetch chat history
    const fetchChats = async () => {
        setChatLoading(true);
        setChatError(null);

        try {
            const response = await fetch(`${API_BASE}/api/chat/history?page=1&limit=5`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch chats: ${response.status}`);
            }

            const result = await response.json();
            setChatSessions(result.data?.sessions || []);
        } catch (error) {
            console.error('Chat fetch error:', error);
            setChatError(error instanceof Error ? error.message : 'Unknown error');
            setChatSessions([]);
        } finally {
            setChatLoading(false);
        }
    };

    // Fetch calendar events
    const fetchCalendar = async () => {
        setCalendarLoading(true);
        setCalendarError(null);

        try {
            // Get events for next 7 days
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const response = await fetch(
                `${API_BASE}/api/calendar/events?maxResults=10&timeMin=${now.toISOString()}&timeMax=${nextWeek.toISOString()}`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch calendar: ${response.status}`);
            }

            const data = await response.json();
            setCalendarEvents(data.events || []);
        } catch (error) {
            console.error('Calendar fetch error:', error);
            setCalendarError(error instanceof Error ? error.message : 'Unknown error');
            setCalendarEvents([]);
        } finally {
            setCalendarLoading(false);
        }
    };

    // Fetch follow-up tasks (Block 8)
    const fetchTasks = async () => {
        setTasksLoading(true);
        setTasksError(null);

        try {
            const response = await fetch(`${API_BASE}/api/followups/debug`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }

            const data = await response.json();
            // Handle potentially different response structures
            const items = data.items || data.tasks || [];
            setTasks(items);
        } catch (error) {
            console.error('Tasks fetch error:', error);
            setTasksError(error instanceof Error ? error.message : 'Unknown error');
            setTasks([]);
        } finally {
            setTasksLoading(false);
        }
    };

    // Refresh all data
    const refresh = () => {
        fetchMedia();
        fetchChats();
        fetchCalendar();
        fetchTasks();
    };

    // Initial fetch on mount
    useEffect(() => {
        refresh();
    }, []);

    return {
        media: {
            items: mediaItems,
            loading: mediaLoading,
            error: mediaError,
        },
        chats: {
            sessions: chatSessions,
            loading: chatLoading,
            error: chatError,
        },
        calendar: {
            events: calendarEvents,
            loading: calendarLoading,
            error: calendarError,
        },
        followups: {
            tasks,
            loading: tasksLoading,
            error: tasksError,
        },
        refresh,

        // Flat API for FollowupWidget
        tasks,
        loading: tasksLoading,
        error: tasksError,
        refetchTasks: fetchTasks,
    };
}
