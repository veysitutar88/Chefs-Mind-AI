import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function MediaStudioPanel() {
  const [contentType, setContentType] = useState<'image' | 'video'>('image');
  const [selectedModel, setSelectedModel] = useState('imagen-3');

  const getModelOptions = () => {
    if (contentType === 'image') {
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

  const handleContentTypeChange = (type: 'image' | 'video') => {
    setContentType(type);
    // Reset model selection when switching content type
    if (type === 'image') {
      setSelectedModel('imagen-3');
    } else {
      setSelectedModel('veo-3');
    }
  };

  return (
    <div className="p-6 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Media Studio</h3>
      
      {/* Content Type Switcher */}
      <div className="bg-muted rounded-lg p-1 mb-4">
        <div className="grid grid-cols-2 gap-1">
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
        
        <Select value={selectedModel} onValueChange={setSelectedModel}>
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
                <Select defaultValue="10s">
                  <SelectTrigger data-testid="select-video-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5s">5 секунд</SelectItem>
                    <SelectItem value="10s">10 секунд</SelectItem>
                    <SelectItem value="15s">15 секунд</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          <p className="flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            {contentType === 'image' 
              ? 'Используйте агент Media Studio для генерации изображений'
              : 'Используйте агент Media Studio для создания видео'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
