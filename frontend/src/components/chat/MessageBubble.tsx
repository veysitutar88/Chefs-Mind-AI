import { Message } from '@/types/chat'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ChefHat, Calculator, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case 'chef':
        return <ChefHat className="h-4 w-4" />
      case 'accountant':
        return <Calculator className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getAgentName = (agent?: string) => {
    switch (agent) {
      case 'chef':
        return 'Шеф-повар'
      case 'accountant':
        return 'Учётчик'
      default:
        return 'Ассистент'
    }
  }

  const getModelColor = (model?: string) => {
    if (model?.includes('gpt')) return 'bg-green-100 text-green-800'
    if (model?.includes('gemini')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser && "flex-row-reverse"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        )}>
          {isUser ? 'U' : getAgentIcon(message.agent)}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isUser && "items-end"
      )}>
        {!isUser && message.agent && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{getAgentName(message.agent)}</span>
            {message.model && (
              <Badge variant="secondary" className={cn("text-xs", getModelColor(message.model))}>
                {message.model}
              </Badge>
            )}
          </div>
        )}
        
        <Card className={cn(
          "px-4 py-2",
          isUser && "bg-primary text-primary-foreground"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </Card>
        
        <div className={cn(
          "text-xs text-muted-foreground",
          isUser && "text-right"
        )}>
          {message.timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}