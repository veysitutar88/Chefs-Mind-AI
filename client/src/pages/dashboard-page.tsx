import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { AgentSelector } from "@/components/sidebar/agent-selector";
import { FileUpload } from "@/components/sidebar/file-upload";
import { ChatInterface } from "@/components/chat/chat-interface";
import { MediaStudioPanel } from "@/components/media-studio/media-studio-panel";
import { AgentPromptsSettings } from "@/components/settings/agent-prompts-settings";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Agent } from "@/types";

const agents: Agent[] = [
  {
    id: 'universal',
    name: 'Универсальный Чат',
    description: 'Автоматическая маршрутизация',
    icon: 'fas fa-comments',
    color: 'bg-primary text-primary-foreground'
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Учет и финансовая аналитика',
    icon: 'fas fa-calculator',
    color: 'bg-chart-1/20 text-chart-1'
  },
  {
    id: 'chef',
    name: 'Chef',
    description: 'Кулинарная экспертиза',
    icon: 'fas fa-utensils',
    color: 'bg-chart-2/20 text-chart-2'
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Анализ данных и прогнозы',
    icon: 'fas fa-chart-line',
    color: 'bg-chart-3/20 text-chart-3'
  },
  {
    id: 'media-studio',
    name: 'Media Studio',
    description: 'Генерация контента',
    icon: 'fas fa-video',
    color: 'bg-chart-5/20 text-chart-5'
  }
];

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Media Studio state
  const [mediaStudioSettings, setMediaStudioSettings] = useState({
    contentType: 'text' as 'text' | 'image' | 'video',
    selectedModel: 'gpt-5'
  });

  // AI Model selection state for regular agents
  const [selectedAiModels, setSelectedAiModels] = useState({
    universal: 'auto',
    accountant: 'gemini-1.5-pro',
    chef: 'gpt-5',
    analyst: 'perplexity'
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/chat/sessions'],
    queryFn: () => api.getChatSessions()
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleAgentSelect = async (agent: Agent) => {
    setSelectedAgent(agent);
    
    // Create new chat session for selected agent
    try {
      const session = await api.createChatSession(agent.id, `${agent.name} Session`);
      setCurrentSessionId(session.id);
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  const handleAiModelChange = (agentId: string, model: string) => {
    setSelectedAiModels(prev => ({
      ...prev,
      [agentId]: model
    }));
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm z-50 relative">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <Logo className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Chef's Mind AI</h1>
              <p className="text-xs text-muted-foreground">Интеллектуальная Аналитическая Платформа</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSettingsOpen(true)}
              data-testid="button-settings"
            >
              <i className="fas fa-cog text-muted-foreground"></i>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleDarkMode}
              data-testid="button-theme-toggle"
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-muted-foreground`}></i>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground" data-testid="text-username">
                  {user?.username || 'Пользователь'}
                </p>
                <p className="text-xs text-muted-foreground">JWT Authenticated</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium hover:bg-primary/90"
                data-testid="button-logout"
              >
                {user?.username?.charAt(0).toUpperCase() || 'У'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-card border-r border-border flex flex-col overflow-hidden">
          <FileUpload />
          <AgentSelector 
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentSelect={handleAgentSelect}
          />
          
          {/* Database Status */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">PostgreSQL</span>
              </div>
              <div className="text-muted-foreground">Dual-User Security</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface 
            selectedAgent={selectedAgent}
            sessionId={currentSessionId}
            mediaStudioSettings={mediaStudioSettings}
            selectedAiModel={selectedAiModels[selectedAgent.id as keyof typeof selectedAiModels]}
            onAiModelChange={(model: string) => handleAiModelChange(selectedAgent.id, model)}
          />
        </main>

        {/* Right Panel */}
        <aside className="w-80 bg-card border-l border-border overflow-y-auto">
          <MediaStudioPanel 
            settings={mediaStudioSettings}
            onSettingsChange={setMediaStudioSettings}
          />
          
          {/* System Status */}
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4">Статус Системы</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>PostgreSQL</span>
                </div>
                <span className="text-muted-foreground" data-testid="status-postgresql">Подключено</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Gemini 2.5 Pro</span>
                </div>
                <span className="text-muted-foreground" data-testid="status-gemini">Активен</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>GPT-5</span>
                </div>
                <span className="text-muted-foreground" data-testid="status-gpt5">Активен</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>SQL Validator</span>
                </div>
                <span className="text-muted-foreground" data-testid="status-sql-validator">Мониторинг</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      
      {/* Agent Settings Modal */}
      <AgentPromptsSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
