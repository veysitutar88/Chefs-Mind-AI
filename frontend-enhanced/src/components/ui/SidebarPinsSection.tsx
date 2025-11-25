import React, { useState, useEffect } from 'react';
import { Pin, Trash2, ExternalLink } from 'lucide-react';
import { Button } from './button';

// Define the Pin interface based on the backend store, even if we mock it for now
interface PinItem {
    id: string;
    userId: string;
    messageId: string;
    sessionId: string;
    content: string;
    createdAt: string;
}

interface SidebarPinsSectionProps {
    className?: string;
}

export const SidebarPinsSection: React.FC<SidebarPinsSectionProps> = ({ className }) => {
    const [pins, setPins] = useState<PinItem[]>([]);
    const [loading, setLoading] = useState(false);

    // TODO: Replace with actual API call when backend endpoints are available
    // GET /api/sidebar/pins
    useEffect(() => {
        setLoading(true);
        // Mock data for now
        setTimeout(() => {
            setPins([
                {
                    id: '1',
                    userId: 'user1',
                    messageId: 'msg1',
                    sessionId: 'sess1',
                    content: 'Recipe for Chocolate Lava Cake',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    userId: 'user1',
                    messageId: 'msg2',
                    sessionId: 'sess1',
                    content: 'Supplier contact for fresh truffles',
                    createdAt: new Date().toISOString()
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const handleUnpin = async (id: string) => {
        // TODO: Replace with actual API call
        // POST /api/sidebar/pins/delete { id }
        setPins(prev => prev.filter(p => p.id !== id));
    };

    const handleNavigate = (sessionId: string, messageId: string) => {
        // TODO: Implement navigation to specific message
        console.log(`Navigate to session ${sessionId}, message ${messageId}`);
    };

    if (loading) {
        return (
            <div className={`p-4 space-y-3 ${className}`}>
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="p-4 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                    <Pin size={16} className="text-accent" />
                    Pinned Items
                </h3>
                <span className="text-[10px] bg-surface border border-white/10 px-2 py-0.5 rounded-full text-textSecondary">
                    {pins.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3 custom-scrollbar">
                {pins.length === 0 ? (
                    <div className="text-center py-8 text-textSecondary opacity-50">
                        <Pin size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No pinned items yet</p>
                    </div>
                ) : (
                    pins.map(pin => (
                        <div 
                            key={pin.id}
                            className="group bg-background/30 border border-white/5 hover:border-accent/30 rounded-xl p-3 transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <p className="text-xs text-textPrimary line-clamp-2 font-medium">
                                    {pin.content}
                                </p>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleNavigate(pin.sessionId, pin.messageId)}
                                        className="p-1 hover:bg-white/10 rounded text-textSecondary hover:text-accent transition-colors"
                                        title="Go to message"
                                    >
                                        <ExternalLink size={12} />
                                    </button>
                                    <button 
                                        onClick={() => handleUnpin(pin.id)}
                                        className="p-1 hover:bg-white/10 rounded text-textSecondary hover:text-red-400 transition-colors"
                                        title="Unpin"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-textSecondary">
                                <span>{new Date(pin.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};