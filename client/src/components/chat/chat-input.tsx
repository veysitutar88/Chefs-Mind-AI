import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (content: string, metadata?: any) => void;
  disabled?: boolean;
  agentType: string;
}

export function ChatInput({ onSendMessage, disabled, agentType }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      setIsTyping(true);
      onSendMessage(message.trim());
      setMessage("");
      
      // Simulate AI thinking time
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    switch (agentType) {
      case 'accountant':
        return 'Задайте вопрос о финансовой аналитике или попросите создать отчет...';
      case 'chef':
        return 'Спросите о рецептах, технологиях приготовления или управлении кухней...';
      case 'analyst':
        return 'Запросите анализ данных или создание SQL запросов...';
      case 'media-studio':
        return 'Опишите изображение или видео, которое нужно создать...';
      default:
        return 'Задайте вопрос об анализе данных, генерации контента или попросите помощь с SQL запросами...';
    }
  };

  return (
    <div className="border-t border-border p-4">
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="resize-none pr-12 min-h-[80px]"
            disabled={disabled}
            data-testid="textarea-chat-input"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-3 bottom-3"
            disabled={!message.trim() || disabled}
            data-testid="button-send-message"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </Button>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="p-3"
            title="Прикрепить файл"
            data-testid="button-attach-file"
          >
            <i className="fas fa-paperclip"></i>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="p-3"
            title="Голосовой ввод"
            data-testid="button-voice-input"
          >
            <i className="fas fa-microphone"></i>
          </Button>
        </div>
      </form>
      
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Нажмите Enter для отправки</span>
          <span>•</span>
          <span>Shift+Enter для новой строки</span>
        </div>
        <div className="flex items-center space-x-2">
          <i className="fas fa-shield-alt text-green-600"></i>
          <span>SQL Validator Активен</span>
        </div>
      </div>
      
      {/* AI Typing Indicator */}
      {isTyping && (
        <div className="flex items-center space-x-2 mt-3 text-sm text-muted-foreground">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>AI обрабатывает запрос...</span>
        </div>
      )}
    </div>
  );
}
