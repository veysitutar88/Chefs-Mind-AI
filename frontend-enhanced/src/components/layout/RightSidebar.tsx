'use client';

import React, { useState } from 'react';
import { useSidebarData } from '@/lib/useSidebarData';
import { usePathname } from 'next/navigation';
import { Folder, CheckSquare, Calendar, PenTool, FileText, Image as ImageIcon, Plus, Check, Sliders, Wand2 } from 'lucide-react';
import { MediaModelSelector } from '../ui/MediaModelSelector';
import { MediaPresetSelector } from '../ui/MediaPresetSelector';
import { AGENTS } from '@/constants/ui';

interface RightSidebarProps {
  onClose: () => void;
}

export function RightSidebar({ onClose }: RightSidebarProps) {
  const pathname = usePathname();
  const { media, tasks, calendar, loading, error, refetchTasks } = useSidebarData();
  const [taskInput, setTaskInput] = useState('');

  // FoodFrame State
  const [selectedModel, setSelectedModel] = useState('imagen-4');
  const [activePreset, setActivePreset] = useState<string | undefined>(undefined);

  // Derived Active Agent
  const activeAgentId = AGENTS.find(a => pathname?.includes(a.id))?.id;
  const isFoodFrame = activeAgentId === 'foodframe';

  // Mock file extensions map
  const getFileIcon = (provider: string) => {
    if (provider === 'gemini') return <FileText size={16} className="text-blue-400" />;
    return <ImageIcon size={16} className="text-purple-400" />;
  };

  // Mock sections based on Design A (Unified Panel)
  return (
    <div className="w-80 h-full bg-slate-950/50 backdrop-blur-xl border-l border-white/5 flex flex-col">

      {/* 1. MEDIA PANEL (FOODFRAME ONLY) OR LIBRARY */}
      {isFoodFrame ? (
        <div className="flex flex-col h-full bg-slate-900/20">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-purple-500/5">
            <h3 className="font-bold text-sm text-purple-400 flex items-center gap-2">
              <Wand2 size={16} />
              CREATIVE STUDIO
            </h3>
            <span className="text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">
              Media Mode
            </span>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto no-scrollbar">
            {/* Model Selector */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 block">Model Engine</label>
              <MediaModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                type="image"
                className="w-full"
              />
            </div>

            {/* Preset Selector */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 block">Styling Presets</label>
              <MediaPresetSelector
                activePresetId={activePreset}
                onSelect={(p) => setActivePreset(p.id)}
              />
            </div>

            {/* Format Selector Stub (Using static buttons for now to match simplicity) */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 block">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '16:9', '9:16'].map(fmt => (
                  <button key={fmt} className="text-xs bg-slate-900 border border-white/10 hover:border-purple-500/50 rounded py-2 text-slate-300 transition-colors">
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD PANEL (Library + To Do) */
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">

          {/* LIBRARY SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Folder size={12} />
                Library
              </h3>
              <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">View All</button>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="h-20 flex items-center justify-center text-xs text-slate-600">Loading assets...</div>
              ) : media.length > 0 ? (
                media.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center">
                      {item.type === 'image' ? <ImageIcon size={14} className="text-purple-400" /> : <FileText size={14} className="text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-300 truncate font-medium">{item.url.split('/').pop()}</div>
                      <div className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-600 italic px-2">No active files found.</div>
              )}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* TO-DO LIST SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare size={12} />
                To-Do List
              </h3>
              <span className="text-[10px] bg-slate-800 px-1.5 rounded text-slate-400">{tasks.filter(t => t.status === 'pending').length}</span>
            </div>

            <div className="space-y-2">
              {/* Quick Add */}
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Add new task..."
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                />
                <button className="bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 p-1.5 rounded transition-all">
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 group cursor-pointer">
                    <div className={`
                        w-5 h-5 rounded-md border flex items-center justify-center transition-all
                        ${task.status === 'completed'
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'border-white/20 hover:border-cyan-500/50 bg-transparent'}
                    `}>
                      {task.status === 'completed' && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className={`text-sm transition-colors ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>
                      {task.title}
                    </span>
                    {task.priority === 'high' && <span className="text-[10px] text-red-400 self-center border border-red-500/20 px-1.5 rounded">High</span>}
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-xs text-slate-600 italic px-2">No pending tasks.</div>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* QUICK TOOLS - Static visual only for Design A compliance */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders size={12} />
              Quick Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-white/5 hover:border-cyan-500/30 rounded-lg group transition-all">
                <Calendar size={16} className="text-slate-400 group-hover:text-cyan-400 mb-2 transition-colors" />
                <span className="text-[10px] text-slate-400 font-medium">Schedule</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-slate-900 border border-white/5 hover:border-cyan-500/30 rounded-lg group transition-all">
                <PenTool size={16} className="text-slate-400 group-hover:text-cyan-400 mb-2 transition-colors" />
                <span className="text-[10px] text-slate-400 font-medium">Notes</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
