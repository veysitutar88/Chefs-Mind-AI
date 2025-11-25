import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Loader2, XCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';

interface Template {
    id: string;
    name: string;
    description?: string;
    content: string;
    agentType?: string;
    category?: string;
    isPublic: boolean;
}

interface SidebarTemplatesSectionProps {
    agentType?: string;
}

export const SidebarTemplatesSection: React.FC<SidebarTemplatesSectionProps> = ({ agentType }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [formState, setFormState] = useState({
        name: '',
        description: '',
        content: '',
        isPublic: false,
    });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/sidebar/templates${agentType ? `?agentType=${agentType}` : ''}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTemplates(data.templates);
        } catch (e: any) {
            setError(e.message);
            console.error('Failed to fetch templates:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [agentType]);

    const handleCreateEdit = async () => {
        setError(null);
        try {
            const url = editingTemplate
                ? `${API_BASE_URL}/api/sidebar/templates/update`
                : `${API_BASE_URL}/api/sidebar/templates/create`;
            const method = 'POST';
            const body = editingTemplate
                ? JSON.stringify({ id: editingTemplate.id, ...formState })
                : JSON.stringify({ ...formState, agentType });

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            await fetchTemplates();
            setIsModalOpen(false);
            setEditingTemplate(null);
            setFormState({ name: '', description: '', content: '', isPublic: false });
        } catch (e: any) {
            setError(e.message);
            console.error('Failed to save template:', e);
        }
    };

    const handleDelete = async (id: string) => {
        setError(null);
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/sidebar/templates/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            await fetchTemplates();
        } catch (e: any) {
            setError(e.message);
            console.error('Failed to delete template:', e);
        }
    };

    const openCreateModal = () => {
        setEditingTemplate(null);
        setFormState({ name: '', description: '', content: '', isPublic: false });
        setIsModalOpen(true);
    };

    const openEditModal = (template: Template) => {
        setEditingTemplate(template);
        setFormState({
            name: template.name,
            description: template.description || '',
            content: template.content,
            isPublic: template.isPublic,
        });
        setIsModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-accent" />
                    Templates
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={openCreateModal}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-textSecondary hover:text-accent transition-colors"
                    title="Create New Template"
                >
                    <Plus size={14} />
                </Button>
            </div>

            {loading && (
                <div className="flex-1 flex items-center justify-center text-textSecondary">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading templates...
                </div>
            )}

            {error && (
                <div className="flex-1 flex flex-col items-center justify-center text-red-400 text-sm">
                    <XCircle className="h-5 w-5 mb-2" />
                    Error: {error}
                    <Button variant="ghost" onClick={fetchTemplates} className="mt-2 text-xs">Retry</Button>
                </div>
            )}

            {!loading && !error && templates.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-textSecondary opacity-50">
                    <FileText size={32} className="mb-2" />
                    <span className="text-xs">No templates found.</span>
                </div>
            )}

            {!loading && !error && templates.length > 0 && (
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                        >
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs text-textPrimary font-medium truncate group-hover:text-accent transition-colors">
                                    {template.name}
                                </span>
                                {template.description && (
                                    <span className="text-[10px] text-textSecondary truncate">
                                        {template.description}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => openEditModal(template)} className="p-1.5 text-textSecondary hover:text-accent">
                                    <Edit size={12} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="p-1.5 text-textSecondary hover:text-red-400">
                                    <Trash2 size={12} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-surface border-white/10 text-textPrimary">
                    <DialogHeader>
                        <DialogTitle className="text-textPrimary">
                            {editingTemplate ? 'Edit Template' : 'Create New Template'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-textSecondary text-sm">
                                Name
                            </label>
                            <Input
                                id="name"
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                className="col-span-3 bg-background/50 border-white/10 text-textPrimary"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="description" className="text-right text-textSecondary text-sm">
                                Description
                            </label>
                            <Input
                                id="description"
                                value={formState.description}
                                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                className="col-span-3 bg-background/50 border-white/10 text-textPrimary"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <label htmlFor="content" className="text-right text-textSecondary text-sm">
                                Content
                            </label>
                            <Textarea
                                id="content"
                                value={formState.content}
                                onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                                className="col-span-3 bg-background/50 border-white/10 text-textPrimary min-h-[100px]"
                            />
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                            <label htmlFor="isPublic" className="text-textSecondary text-sm">
                                Public
                            </label>
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={formState.isPublic}
                                onChange={(e) => setFormState({ ...formState, isPublic: e.target.checked })}
                                className="h-4 w-4 text-accent focus:ring-accent border-white/10 rounded"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:bg-white/10">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateEdit} className="bg-accent text-white hover:bg-accentSoft shadow-glow hover:shadow-glow-active">
                            {editingTemplate ? 'Save Changes' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};