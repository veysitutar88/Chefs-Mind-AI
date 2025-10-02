import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSTT } from "@/hooks/use-stt";

interface ChatInputProps {
  onSendMessage: (content: string, metadata?: any) => void;
  disabled?: boolean;
  agentType: string;
}

export function ChatInput({ onSendMessage, disabled, agentType }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // STT hook with Web Speech API fallback
  const { 
    isRecording, 
    toggleRecording, 
    useWebSpeech 
  } = useSTT({
    language: 'ru',
    onPartialResult: (text) => {
      // Update message with partial results (optional, can be removed if too distracting)
      console.log('Partial result:', text);
    },
    onFinalResult: (text) => {
      // Append final result to message
      setMessage(prev => prev + (prev ? ' ' : '') + text);
      toast({
        title: "Голосовой ввод",
        description: "Аудио успешно преобразовано в текст",
      });
    },
    onError: (error) => {
      console.error('STT error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось преобразовать аудио в текст",
        variant: "destructive",
      });
    },
  });

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

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }
          
          return await response.json();
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        
        setAttachedFiles(prev => [...prev, ...files]);
        toast({
          title: "Файлы загружены",
          description: `Успешно загружено ${files.length} файл(ов)`,
        });
      } catch (error) {
        console.error('File upload error:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить файлы",
          variant: "destructive",
        });
      }
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
            onClick={handleFileAttach}
          >
            <i className="fas fa-paperclip"></i>
          </Button>
          <Button
            type="button"
            variant={isRecording ? "destructive" : "secondary"}
            size="sm"
            className="p-3"
            title={isRecording ? "Остановить запись" : `Голосовой ввод${useWebSpeech ? ' (Web Speech)' : ' (WebSocket)'}`}
            data-testid="button-voice-input"
            onClick={toggleRecording}
          >
            <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
          </Button>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </form>
      
      {/* Show attached files */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {attachedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs">
              <i className="fas fa-file"></i>
              <span>{file.name}</span>
              <button
                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                className="text-muted-foreground hover:text-foreground"
                title="Удалить файл"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Нажмите Enter для отправки</span>
          <span>•</span>
          <span>Shift+Enter для новой строки</span>
          {isRecording && (
            <>
              <span>•</span>
              <span className="text-red-500 animate-pulse">
                <i className="fas fa-circle mr-1"></i>
                Идет запись...
              </span>
            </>
          )}
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
