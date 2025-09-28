import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function FileUpload() {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadFile(file),
    onSuccess: (result) => {
      toast({
        title: "Файл успешно загружен",
        description: `Таблица создана: ${result.tableName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка загрузки файла",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Неподдерживаемый формат файла",
        description: "Поддерживаются только CSV и XLSX файлы",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Импорт Данных</h3>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/10'
            : 'border-border hover:bg-muted/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        data-testid="file-upload-area"
      >
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Загрузка файла...</p>
          </div>
        ) : (
          <>
            <i className="fas fa-cloud-upload-alt text-2xl text-muted-foreground mb-2"></i>
            <p className="text-sm text-muted-foreground mb-1">Перетащите CSV/XLSX файлы</p>
            <p className="text-xs text-muted-foreground">или нажмите для выбора</p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        data-testid="file-input"
      />
    </div>
  );
}
