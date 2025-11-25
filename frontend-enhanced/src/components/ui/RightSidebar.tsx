import React, { useState } from 'react';
import { FileItem, TodoItem } from '@/types/ui';
import {
    FolderOpen,
    Calendar as CalendarIcon,
    Image as ImageIcon,
    Search,
    FileText,
    File,
    CheckSquare,
    Plus,
    Trash2,
    Check,
    Upload,
    Clock
} from 'lucide-react';
import { AssetGallery } from '../media/AssetGallery';

interface RightSidebarProps {
    files: FileItem[];
    todos?: TodoItem[];
    onAddTodo?: (text: string) => void;
    onToggleTodo?: (id: string) => void;
    onDeleteTodo?: (id: string) => void;
}

type TabId = 'search' | 'library' | 'assets' | 'calendar';

export const RightSidebar: React.FC<RightSidebarProps> = ({
    files,
    todos = [],
    onAddTodo,
    onToggleTodo,
    onDeleteTodo
}) => {
    const [activeTab, setActiveTab] = useState<TabId>('library');
    const [newTodoText, setNewTodoText] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim() && onAddTodo) {
            onAddTodo(newTodoText);
            setNewTodoText('');
        }
    };

    const tabs: { id: TabId; icon: React.ElementType; label: string }[] = [
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'library', icon: FolderOpen, label: 'Library' },
        { id: 'assets', icon: ImageIcon, label: 'Assets' },
        { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    ];

    return (
        <div className="h-full flex flex-col bg-surface/30 border-l border-white/5 backdrop-blur-sm">

            {/* Tab Navigation */}
            <div className="flex items-center p-2 gap-1 border-b border-white/5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-accent/10 text-accent shadow-[0_0_10px_rgba(75,201,255,0.1)]'
                                : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'
                            }
                        `}
                        title={tab.label}
                    >
                        <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        <span className="text-[9px] mt-1 font-medium uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* SEARCH TAB */}
                {activeTab === 'search' && (
                    <div className="h-full flex flex-col p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Search size={16} className="text-accent" />
                            Search History
                        </h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={14} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full bg-background/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-textSecondary opacity-50">
                            <Clock size={32} className="mb-2" />
                            <span className="text-xs">No recent searches</span>
                        </div>
                    </div>
                )}

                {/* LIBRARY TAB */}
                {activeTab === 'library' && (
                    <div className="h-full flex flex-col p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                                <FolderOpen size={16} className="text-accent" />
                                Library
                            </h3>
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-textSecondary hover:text-accent transition-colors" title="Upload File">
                                <Upload size={14} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                            {files.map(file => {
                                let Icon = File;
                                if (file.type === 'image') Icon = ImageIcon;
                                if (file.type === 'doc') Icon = FileText;

                                return (
                                    <div key={file.id} className="group flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer">
                                        <div className="p-1.5 bg-background/50 rounded-lg text-accentSoft">
                                            <Icon size={14} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs text-textPrimary font-medium truncate group-hover:text-accent transition-colors">
                                                {file.name}
                                            </span>
                                            <span className="text-[10px] text-textSecondary">
                                                {file.date}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ASSETS TAB */}
                {activeTab === 'assets' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-4 pb-2">
                            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon size={16} className="text-accent" />
                                Media Assets
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* We pass a custom class to override some styles for the sidebar context */}
                            <AssetGallery className="border-none shadow-none bg-transparent p-2 [&_.grid]:grid-cols-1 [&_.grid]:gap-3" />
                        </div>
                    </div>
                )}

                {/* CALENDAR TAB (Contains To-Do for now) */}
                {activeTab === 'calendar' && (
                    <div className="h-full flex flex-col p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                                <CalendarIcon size={16} className="text-accent" />
                                Schedule & Tasks
                            </h3>
                            <span className="text-[10px] bg-surface border border-white/10 px-2 py-0.5 rounded-full text-textSecondary">
                                {todos.filter(t => t.completed).length}/{todos.length}
                            </span>
                        </div>

                        {/* Calendar Placeholder */}
                        <div className="bg-background/30 rounded-lg p-3 mb-4 border border-white/5 text-center">
                            <span className="text-xs text-textSecondary">Calendar View Coming Soon</span>
                        </div>

                        {/* To-Do List */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h4 className="text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wide">Daily Tasks</h4>

                            <form onSubmit={handleAddSubmit} className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newTodoText}
                                    onChange={(e) => setNewTodoText(e.target.value)}
                                    placeholder="Add task..."
                                    className="flex-1 bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-accent/50 placeholder:text-textSecondary/50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newTodoText.trim()}
                                    className="bg-accent text-white p-2 rounded-lg hover:bg-accentSoft disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-glow hover:shadow-glow-active"
                                >
                                    <Plus size={14} />
                                </button>
                            </form>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {todos.length === 0 && (
                                    <div className="text-center text-[10px] text-textSecondary mt-4">
                                        No tasks yet.
                                    </div>
                                )}
                                {todos.map(todo => (
                                    <div
                                        key={todo.id}
                                        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <button
                                            onClick={() => onToggleTodo?.(todo.id)}
                                            className={`
                                                w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0
                                                ${todo.completed
                                                    ? 'bg-accent border-accent text-white shadow-glow'
                                                    : 'bg-transparent border-white/20 hover:border-accent text-transparent'
                                                }
                                            `}
                                        >
                                            <Check size={10} strokeWidth={3} />
                                        </button>

                                        <span
                                            className={`flex-1 text-xs transition-colors break-words ${todo.completed ? 'text-textSecondary line-through' : 'text-textPrimary'}`}
                                        >
                                            {todo.text}
                                        </span>

                                        <button
                                            onClick={() => onDeleteTodo?.(todo.id)}
                                            className="text-textSecondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

