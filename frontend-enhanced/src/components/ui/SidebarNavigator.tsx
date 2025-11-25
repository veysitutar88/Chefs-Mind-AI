import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Navigation } from 'lucide-react';
import { Button } from './button';

interface SidebarNavigatorProps {
    className?: string;
    onNavigate?: (messageId: string) => void;
}

export const SidebarNavigator: React.FC<SidebarNavigatorProps> = ({ className, onNavigate }) => {
    const [loading, setLoading] = useState<'up' | 'down' | null>(null);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [totalMessages, setTotalMessages] = useState(10); // Mock total

    const handleNavigate = async (direction: 'up' | 'down') => {
        setLoading(direction);
        
        try {
            // TODO: Replace with actual API call when backend endpoints are fully implemented
            // GET /api/sidebar/nav/messages?direction=${direction}&fromMessageId=...
            
            // Mock navigation logic
            await new Promise(resolve => setTimeout(resolve, 300));
            
            let nextIndex = currentMessageIndex;
            if (direction === 'up' && currentMessageIndex > 0) {
                nextIndex--;
            } else if (direction === 'down' && currentMessageIndex < totalMessages - 1) {
                nextIndex++;
            }
            
            setCurrentMessageIndex(nextIndex);
            
            // Mock message ID for scrolling
            const mockMessageId = `msg-${nextIndex}`;
            
            if (onNavigate) {
                onNavigate(mockMessageId);
            } else {
                // Fallback: try to find element and scroll if onNavigate not provided
                // This is a "best effort" attempt without changing parent components
                const element = document.getElementById(mockMessageId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    console.log(`[Navigator] Would scroll to message ${mockMessageId}`);
                }
            }
            
        } catch (error) {
            console.error(`Navigation ${direction} failed:`, error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="p-4 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                    <Navigation size={16} className="text-accent" />
                    Navigator
                </h3>
                <span className="text-[10px] text-textSecondary">
                    {currentMessageIndex + 1} / {totalMessages}
                </span>
            </div>

            <div className="px-4 pb-4">
                <div className="bg-background/30 border border-white/10 rounded-xl p-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-textSecondary uppercase tracking-wider">Current Focus</span>
                        <span className="text-xs text-textPrimary font-medium truncate w-32">
                            Message #{currentMessageIndex + 1}
                        </span>
                    </div>
                    
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigate('up')}
                            disabled={!!loading || currentMessageIndex === 0}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-white/10 hover:text-accent disabled:opacity-30"
                            title="Previous Message"
                        >
                            <ChevronUp size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigate('down')}
                            disabled={!!loading || currentMessageIndex === totalMessages - 1}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-white/10 hover:text-accent disabled:opacity-30"
                            title="Next Message"
                        >
                            <ChevronDown size={16} />
                        </Button>
                    </div>
                </div>
                
                {/* Context info about current message (Mock) */}
                <div className="mt-2 px-1">
                    <p className="text-[10px] text-textSecondary line-clamp-2 italic">
                        "This is a preview of the message content at index {currentMessageIndex}..."
                    </p>
                </div>
            </div>
        </div>
    );
};