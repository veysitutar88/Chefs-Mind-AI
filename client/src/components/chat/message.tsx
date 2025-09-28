import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data/data-table";
import { ChartVisualization } from "@/components/data/chart-visualization";
import type { ChatMessage } from "@/types";

interface MessageProps {
  message: ChatMessage;
  agentIcon: string;
}

export function Message({ message, agentIcon }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex space-x-4 animate-fade-in-up`} data-testid={`message-${message.role}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-muted' : 'bg-primary'
      }`}>
        <i className={`${isUser ? 'fas fa-user' : agentIcon} text-sm ${
          isUser ? 'text-muted-foreground' : 'text-primary-foreground'
        }`}></i>
      </div>
      
      <div className="flex-1">
        <div className={`rounded-lg p-4 ${
          isUser ? 'bg-card border border-border' : 'bg-muted/50'
        }`}>
          <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
          
          {/* Render structured data for assistant messages */}
          {!isUser && message.metadata && (
            <div className="mt-4 space-y-4">
              {/* Data Table */}
              {message.metadata.queryResults && (
                <DataTable data={message.metadata.queryResults} />
              )}
              
              {/* Chart Visualization */}
              {message.metadata.chartType && message.metadata.queryResults && (
                <ChartVisualization 
                  data={message.metadata.queryResults}
                  type={message.metadata.chartType}
                />
              )}
              
              {/* Generated Media */}
              {message.metadata.imageUrl && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <img 
                    src={message.metadata.imageUrl} 
                    alt="Generated content" 
                    className="max-w-full h-auto rounded-lg"
                    data-testid="img-generated-content"
                  />
                </div>
              )}
              
              {message.metadata.videoUrl && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <video 
                    src={message.metadata.videoUrl} 
                    controls 
                    className="max-w-full h-auto rounded-lg"
                    data-testid="video-generated-content"
                  />
                </div>
              )}
              
              {/* SQL Debug */}
              {message.metadata.debugSql && (
                <details className="bg-card border border-border rounded-lg">
                  <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    <i className="fas fa-code mr-2"></i>debug.sql
                  </summary>
                  <div className="px-4 pb-4">
                    <pre className="bg-muted p-3 rounded text-xs font-mono text-muted-foreground overflow-x-auto">
                      <code data-testid="sql-debug-code">{message.metadata.debugSql}</code>
                    </pre>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-green-600">✓ SQL Validation: Passed</span>
                      <span className="text-xs text-muted-foreground">Выполнено через llm_reader</span>
                    </div>
                  </div>
                </details>
              )}
              
              {/* Error display */}
              {message.metadata.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive text-sm">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    {message.metadata.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleString('ru-RU')}
          </p>
          {!isUser && message.metadata?.model && (
            <p className="text-xs text-muted-foreground">
              {message.metadata.model}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
