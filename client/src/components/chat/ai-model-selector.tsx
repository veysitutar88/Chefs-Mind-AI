import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AIModelSelectorProps {
  agentType: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'perplexity';
  speed: 'fast' | 'medium' | 'slow';
  capabilities: string[];
}

interface ModelOption {
  value: string;
  label: string;
  provider: string;
  speed: string;
}

export function AIModelSelector({ agentType, selectedModel, onModelChange }: AIModelSelectorProps) {
  const { data: modelsData } = useQuery<{ data: ModelConfig[] }>({
    queryKey: ['/api/models'],
    enabled: true,
  });

  const models: ModelConfig[] = modelsData?.data || [];

  const getModelOptions = () => {
    switch (agentType) {
      case 'universal':
        return [
          { value: 'auto', label: 'Автоматический выбор', provider: 'auto', speed: 'smart' },
          ...models.map((m: ModelConfig) => ({
            value: m.id,
            label: m.name,
            provider: m.provider,
            speed: m.speed
          }))
        ];
      case 'accountant':
        return models
          .filter((m: ModelConfig) => m.capabilities.includes('analysis'))
          .map((m: ModelConfig) => ({
            value: m.id,
            label: m.name,
            provider: m.provider,
            speed: m.speed
          }));
      case 'chef':
        return models
          .filter((m: ModelConfig) => m.capabilities.includes('chat') || m.capabilities.includes('creative'))
          .map((m: ModelConfig) => ({
            value: m.id,
            label: m.name,
            provider: m.provider,
            speed: m.speed
          }));
      case 'analyst':
        return [
          ...models
            .filter((m: ModelConfig) => m.provider === 'perplexity')
            .map((m: ModelConfig) => ({
              value: m.id,
              label: `${m.name} (Исследования)`,
              provider: m.provider,
              speed: m.speed
            })),
          ...models
            .filter((m: ModelConfig) => m.capabilities.includes('analysis') && m.provider !== 'perplexity')
            .map((m: ModelConfig) => ({
              value: m.id,
              label: m.name,
              provider: m.provider,
              speed: m.speed
            }))
        ];
      default:
        return models.map((m: ModelConfig) => ({
          value: m.id,
          label: m.name,
          provider: m.provider,
          speed: m.speed
        }));
    }
  };

  const getDefaultModel = () => {
    switch (agentType) {
      case 'universal':
        return 'auto';
      case 'accountant':
        return 'gemini-1.5-pro';
      case 'chef':
        return 'gpt-4o';
      case 'analyst':
        return 'sonar';
      default:
        return 'auto';
    }
  };

  const modelOptions = getModelOptions();
  const currentModel = selectedModel || getDefaultModel();
  const currentOption = modelOptions.find((opt: ModelOption) => opt.value === currentModel);

  const getSpeedBadge = (speed: string) => {
    if (speed === 'smart') {
      return <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700 border-purple-200">Умный</Badge>;
    }
    switch (speed) {
      case 'fast':
        return <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-700 border-green-200">Быстро</Badge>;
      case 'medium':
        return <Badge className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 border-blue-200">Средне</Badge>;
      case 'slow':
        return <Badge className="text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700 border-orange-200">Точно</Badge>;
      default:
        return null;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'google':
        return '🔷';
      case 'perplexity':
        return '🔍';
      case 'auto':
        return '⚡';
      default:
        return '🤖';
    }
  };

  return (
    <div className="p-4 border-b border-border bg-muted/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">Модель ИИ</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {getProviderIcon(currentOption?.provider || 'auto')} {currentOption?.label || 'Выбрать модель'}
            </span>
            {currentOption && getSpeedBadge(currentOption.speed)}
          </div>
        </div>
        
        <Select value={currentModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-full h-8" data-testid="select-ai-model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option: ModelOption) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{getProviderIcon(option.provider)}</span>
                  <span>{option.label}</span>
                  {getSpeedBadge(option.speed)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
