import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { AgentSettings } from '@shared/schema';

const agentTypes = [
  { id: 'Accountant', name: 'Accountant', description: 'Учет и финансовая аналитика' },
  { id: 'Chef', name: 'Chef', description: 'Кулинарная экспертиза' }, 
  { id: 'Analyst', name: 'Analyst', description: 'Анализ данных и прогнозы' },
  { id: 'Media Studio', name: 'Media Studio', description: 'Генерация контента' }
];

const defaultPrompts = {
  'Accountant': 'Вы - профессиональный бухгалтер и финансовый аналитик. Вы специализируетесь на учете ресторанного бизнеса в Берлине. Отвечайте на немецком языке, используя профессиональную терминологию.',
  'Chef': 'Вы - опытный шеф-повар с экспертизой в европейской кухне. Вы знаете немецкие и международные кулинарные традиции. Отвечайте на немецком языке, давая практические советы по готовке.',
  'Analyst': 'Вы - аналитик данных, специализирующийся на исследованиях ресторанного рынка в Берлине. Используйте актуальные данные и источники. Отвечайте на немецком языке.',
  'Media Studio': 'Вы - креативный директор, специализирующийся на создании контента для ресторанного бизнеса. Создавайте качественные описания для изображений и видео. Отвечайте на немецком языке.'
};

interface AgentPromptsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentPromptsSettings({ isOpen, onClose }: AgentPromptsSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing agent settings
  const { data: agentSettings, isLoading } = useQuery({
    queryKey: ['/api/agent-settings'],
    queryFn: () => api.getAgentSettings(),
    enabled: isOpen
  });

  // Create or update agent settings mutation
  const updatePromptMutation = useMutation({
    mutationFn: async ({ agentType, systemPrompt }: { agentType: string; systemPrompt: string }) => {
      const existingSetting = agentSettings?.find((s: AgentSettings) => s.agentType === agentType);
      
      if (existingSetting) {
        return api.updateAgentSettings(existingSetting.id, { systemPrompt });
      } else {
        return api.createAgentSettings({ agentType, systemPrompt });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-settings'] });
    }
  });

  // Save all prompts
  const saveAllMutation = useMutation({
    mutationFn: async () => {
      const promises = agentTypes.map(({ id }) => {
        const systemPrompt = prompts[id] || defaultPrompts[id as keyof typeof defaultPrompts];
        return updatePromptMutation.mutateAsync({ agentType: id, systemPrompt });
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: 'Успешно сохранено',
        description: 'Системные промпты агентов обновлены.',
      });
      setHasChanges(false);
    },
    onError: (error) => {
      toast({
        title: 'Ошибка сохранения',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive',
      });
    }
  });

  // Initialize prompts from settings or defaults
  useEffect(() => {
    if (agentSettings && isOpen) {
      const initialPrompts: Record<string, string> = {};
      
      agentTypes.forEach(({ id }) => {
        const setting = agentSettings.find((s: AgentSettings) => s.agentType === id);
        initialPrompts[id] = setting?.systemPrompt || defaultPrompts[id as keyof typeof defaultPrompts];
      });
      
      setPrompts(initialPrompts);
      setHasChanges(false);
    }
  }, [agentSettings, isOpen]);

  const handlePromptChange = (agentType: string, value: string) => {
    setPrompts(prev => ({
      ...prev,
      [agentType]: value
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setPrompts(defaultPrompts);
    setHasChanges(true);
    toast({
      title: 'Сброс к настройкам по умолчанию',
      description: 'Промпты восстановлены к стандартным значениям.',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="modal-agent-settings">
      <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Настройки Промптов Агентов</h2>
            <p className="text-sm text-muted-foreground">Настройте системные инструкции для каждого AI агента</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-settings"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Загрузка настроек...</div>
            </div>
          ) : (
            <>
              {agentTypes.map(({ id, name, description }) => (
                <Card key={id} data-testid={`card-agent-${id.toLowerCase().replace(' ', '-')}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className={`fas ${
                        id === 'Accountant' ? 'fa-calculator' :
                        id === 'Chef' ? 'fa-utensils' :
                        id === 'Analyst' ? 'fa-chart-line' :
                        'fa-video'
                      } text-primary`}></i>
                      <span>{name}</span>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor={`prompt-${id}`} className="text-sm font-medium">
                      Системный промпт
                    </Label>
                    <Textarea
                      id={`prompt-${id}`}
                      value={prompts[id] || ''}
                      onChange={(e) => handlePromptChange(id, e.target.value)}
                      placeholder={`Введите системный промпт для агента ${name}...`}
                      className="mt-2 min-h-[120px] resize-y"
                      data-testid={`textarea-prompt-${id.toLowerCase().replace(' ', '-')}`}
                    />
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saveAllMutation.isPending}
            data-testid="button-reset-defaults"
          >
            <i className="fas fa-undo mr-2"></i>
            Сбросить к умолчанию
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={saveAllMutation.isPending}
              data-testid="button-cancel"
            >
              Отмена
            </Button>
            <Button
              onClick={() => saveAllMutation.mutate()}
              disabled={!hasChanges || saveAllMutation.isPending}
              data-testid="button-save-prompts"
            >
              {saveAllMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Сохранение...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}