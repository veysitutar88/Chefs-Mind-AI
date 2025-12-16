import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit2, Tag } from 'lucide-react';
import { Button } from './button';

// Define the Favorite interface based on the backend store
interface FavoriteItem {
    id: string;
    userId: string;
    type: 'snippet' | 'prompt';
    title: string;
    content: string;
    tags?: string[];
    createdAt: string;
}

interface SidebarFavoritesSectionProps {
    className?: string;
}

export const SidebarFavoritesSection: React.FC<SidebarFavoritesSectionProps> = ({ className }) => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(false);

    // TODO: Replace with actual API call when backend endpoints are available
    // GET /api/sidebar/favorites
    useEffect(() => {
        setLoading(true);
        // Mock data for now
        setTimeout(() => {
            setFavorites([
                {
                    id: '1',
                    userId: 'user1',
                    type: 'prompt',
                    title: 'Food Photography Prompt',
                    content: 'Professional food photography, top-down view, natural lighting, 8k resolution',
                    tags: ['media', 'photo'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    userId: 'user1',
                    type: 'snippet',
                    title: 'Standard Email Signature',
                    content: 'Best regards,\nChef John Doe\nHead Chef, The Gourmet Kitchen',
                    tags: ['email', 'admin'],
                    createdAt: new Date().toISOString()
                }
            ]);
            setLoading(false);
        }, 600);
    }, []);

    const handleRemove = async (id: string) => {
        // TODO: Replace with actual API call
        // POST /api/sidebar/favorites/delete { id }
        setFavorites(prev => prev.filter(f => f.id !== id));
    };

    const handleEdit = (id: string) => {
        // TODO: Implement edit functionality
        console.log(`Edit favorite ${id}`);
    };

    if (loading) {
        return (
            <div className={`p-4 space-y-3 ${className}`}>
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="p-4 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                    <Star size={16} className="text-accent" />
                    Favorites
                </h3>
                <span className="text-[10px] bg-surface border border-white/10 px-2 py-0.5 rounded-full text-textSecondary">
                    {favorites.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3 custom-scrollbar">
                {favorites.length === 0 ? (
                    <div className="text-center py-8 text-textSecondary opacity-50">
                        <Star size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No favorites yet</p>
                    </div>
                ) : (
                    favorites.map(fav => (
                        <div 
                            key={fav.id}
                            className="group bg-background/30 border border-white/5 hover:border-accent/30 rounded-xl p-3 transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="text-xs font-bold text-textPrimary truncate">
                                    {fav.title}
                                </h4>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(fav.id)}
                                        className="p-1 hover:bg-white/10 rounded text-textSecondary hover:text-accent transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button 
                                        onClick={() => handleRemove(fav.id)}
                                        className="p-1 hover:bg-white/10 rounded text-textSecondary hover:text-red-400 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-[11px] text-textSecondary line-clamp-2 mb-2 font-mono bg-black/20 p-1.5 rounded border border-white/5">
                                {fav.content}
                            </p>

                            {fav.tags && fav.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {fav.tags.map(tag => (
                                        <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-accent/10 text-accent rounded flex items-center gap-1">
                                            <Tag size={8} />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};