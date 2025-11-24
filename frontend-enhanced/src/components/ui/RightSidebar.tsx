import React, { useState } from 'react';
import { FileItem, TodoItem } from '@/types/ui';
import { FolderOpen, Calendar, PenTool, Upload, FileText, Image as ImageIcon, File, CheckSquare, Plus, Trash2, Check } from 'lucide-react';

interface RightSidebarProps {
    files: FileItem[];
    todos?: TodoItem[];
    onAddTodo?: (text: string) => void;
    onToggleTodo?: (id: string) => void;
    onDeleteTodo?: (id: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
    files,
    todos = [],
    onAddTodo,
    onToggleTodo,
    onDeleteTodo
}) => {
    const [newTodoText, setNewTodoText] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim() && onAddTodo) {
            onAddTodo(newTodoText);
            setNewTodoText('');
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">

            {/* Library Section (Compact) */}
            <div className="flex flex-col gap-4 max-h-[35%]">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                        <FolderOpen size={16} className="text-accent" />
                        Library
                    </h3>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-textSecondary hover:text-accent transition-colors" title="Upload File">
                        <Upload size={14} />
                    </button>
                </div>

                <div className="flex-1 bg-surface/30 rounded-xl border border-white/5 p-4 overflow-y-auto space-y-3 min-h-0 custom-scrollbar">
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

            {/* To-Do List Section (Expanded) */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare size={16} className="text-accent" />
                        To-Do List
                    </h3>
                    <span className="text-[10px] bg-surface border border-white/10 px-2 py-0.5 rounded-full text-textSecondary">
                        {todos.filter(t => t.completed).length}/{todos.length}
                    </span>
                </div>

                <div className="flex-1 bg-surface/30 rounded-xl border border-white/5 p-4 flex flex-col min-h-0">

                    {/* Input */}
                    <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
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

                    {/* List */}
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
                    w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0
                    ${todo.completed
                                            ? 'bg-accent border-accent text-white shadow-glow'
                                            : 'bg-transparent border-white/20 hover:border-accent text-transparent'
                                        }
                  `}
                                >
                                    <Check size={12} strokeWidth={3} />
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
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Tools Section */}
            <div className="flex flex-col gap-4 shrink-0">
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider px-2">
                    Quick Tools
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center gap-2 p-3 bg-surface/30 rounded-xl border border-white/5 hover:border-accent/50 hover:bg-surface/50 transition-all group hover:shadow-premium hover:scale-[1.02]">
                        <Calendar size={20} className="text-textSecondary group-hover:text-accent" />
                        <span className="text-[10px] text-textSecondary font-medium group-hover:text-textPrimary">Calendar</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 bg-surface/30 rounded-xl border border-white/5 hover:border-accent/50 hover:bg-surface/50 transition-all group hover:shadow-premium hover:scale-[1.02]">
                        <PenTool size={20} className="text-textSecondary group-hover:text-accent" />
                        <span className="text-[10px] text-textSecondary font-medium group-hover:text-textPrimary">Sketchboard</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
