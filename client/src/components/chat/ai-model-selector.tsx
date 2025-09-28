import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AIModelSelectorProps {
  agentType: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function AIModelSelector({ agentType, selectedModel, onModelChange }: AIModelSelectorProps) {
  const getModelOptions = () => {
    switch (agentType) {
      case 'universal':
        return [
          { value: 'auto', label: 'Автоматический выбор' },
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Google)' },
          { value: 'gpt-5', label: 'GPT-5 (OpenAI)' }
        ];
      case 'accountant':
        return [
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Google)' },
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
          { value: 'gpt-5', label: 'GPT-5 (OpenAI)' }
        ];
      case 'chef':
        return [
          { value: 'gpt-5', label: 'GPT-5 (OpenAI)' },
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Google)' }
        ];
      case 'analyst':
        return [
          { value: 'perplexity', label: 'Perplexity (Исследования)' },
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Google)' },
          { value: 'gpt-5', label: 'GPT-5 (OpenAI)' }
        ];
      default:
        return [
          { value: 'gpt-5', label: 'GPT-5 (OpenAI)' },
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Google)' }
        ];
    }
  };

  const getDefaultModel = () => {
    switch (agentType) {
      case 'universal':
        return 'auto';
      case 'accountant':
        return 'gemini-2.5-pro';
      case 'chef':
        return 'gpt-5';
      case 'analyst':
        return 'perplexity';
      default:
        return 'gpt-5';
    }
  };

  const modelOptions = getModelOptions();
  const currentModel = selectedModel || getDefaultModel();

  return (
    <div className="p-4 border-b border-border bg-muted/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">Модель ИИ</Label>
          <span className="text-xs text-muted-foreground">
            {modelOptions.find(opt => opt.value === currentModel)?.label}
          </span>
        </div>
        
        <Select value={currentModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-full h-8" data-testid="select-ai-model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}