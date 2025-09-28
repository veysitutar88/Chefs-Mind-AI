import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MediaStudioPanelProps {
  settings: {
    contentType: 'text' | 'image' | 'video';
    selectedModel: string;
  };
  onSettingsChange: (settings: { contentType: 'text' | 'image' | 'video'; selectedModel: string; }) => void;
}

export function MediaStudioPanel({ settings, onSettingsChange }: MediaStudioPanelProps) {
  const { contentType, selectedModel } = settings;

  const getModelOptions = () => {
    if (contentType === 'text') {
      return [
        { value: 'gpt-5', label: 'GPT-5 (OpenAI)' }
      ];
    } else if (contentType === 'image') {
      return [
        { value: 'imagen-3', label: 'Imagen 3 (Google)' },
        { value: 'dall-e-3', label: 'DALL·E 3 (OpenAI)' }
      ];
    } else {
      return [
        { value: 'veo-3', label: 'Veo 3 (Google)' }
      ];
    }
  };

  const handleContentTypeChange = (type: 'text' | 'image' | 'video') => {
    let newModel: string;
    // Reset model selection when switching content type
    if (type === 'text') {
      newModel = 'gpt-5';
    } else if (type === 'image') {
      newModel = 'imagen-3';
    } else {
      newModel = 'veo-3';
    }
    
    onSettingsChange({
      contentType: type,
      selectedModel: newModel
    });
  };

  const handleModelChange = (model: string) => {
    onSettingsChange({
      contentType,
      selectedModel: model
    });
  };

  return (
    <div className="p-6 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Media Studio</h3>
      
      {/* Content Type Switcher */}
      <div className="bg-muted rounded-lg p-1 mb-4">
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant={contentType === 'text' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => handleContentTypeChange('text')}
            data-testid="button-content-type-text"
          >
            <i className="fas fa-align-left mr-1"></i>Текст
          </Button>
          <Button
            variant={contentType === 'image' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => handleContentTypeChange('image')}
            data-testid="button-content-type-image"
          >
            <i className="fas fa-image mr-1"></i>Изображения
          </Button>
          <Button
            variant={contentType === 'video' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => handleContentTypeChange('video')}
            data-testid="button-content-type-video"
          >
            <i className="fas fa-video mr-1"></i>Видео
          </Button>
        </div>
      </div>
      
      {/* Model Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">Модель ИИ</Label>
          <span className="text-xs text-muted-foreground">
            {getModelOptions().find(opt => opt.value === selectedModel)?.label}
          </span>
        </div>
        
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger className="w-full" data-testid="select-ai-model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getModelOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Parameters */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">Параметры</Label>
          <div className="grid grid-cols-2 gap-2">
            {contentType === 'text' && (
              <>
                <Select defaultValue="creative">
                  <SelectTrigger data-testid="select-text-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creative">Творческий</SelectItem>
                    <SelectItem value="professional">Профессиональный</SelectItem>
                    <SelectItem value="casual">Неформальный</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="medium">
                  <SelectTrigger data-testid="select-text-length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Короткий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="long">Длинный</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {contentType === 'image' && (
              <>
                <Select defaultValue="1024x1024">
                  <SelectTrigger data-testid="select-image-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">1024x1024</SelectItem>
                    <SelectItem value="1792x1024">1792x1024</SelectItem>
                    <SelectItem value="1024x1792">1024x1792</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="high">
                  <SelectTrigger data-testid="select-image-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Высокое</SelectItem>
                    <SelectItem value="standard">Стандартное</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {contentType === 'video' && (
              <>
                <Select defaultValue="720p">
                  <SelectTrigger data-testid="select-video-resolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="8s">
                  <SelectTrigger data-testid="select-video-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4s">4 секунды</SelectItem>
                    <SelectItem value="6s">6 секунд</SelectItem>
                    <SelectItem value="8s">8 секунд</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          <p className="flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            {contentType === 'text' 
              ? 'Используйте агент Media Studio для создания текстового контента'
              : contentType === 'image' 
              ? 'Используйте агент Media Studio для генерации изображений'
              : 'Используйте агент Media Studio для создания видео'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
