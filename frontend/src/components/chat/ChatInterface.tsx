import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { Message } from '@/types/chat'
import { sendMessage } from '@/lib/api'
import { Card } from '@/components/ui/card'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      }
    }, 100)
  }

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    
    try {
      const result = await sendMessage(message)
      setMessages(prev => [...prev, ...result.messages])
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card className="h-[600px] flex flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Добро пожаловать в Chef's Mind AI</h3>
              <p className="text-sm">Задайте вопрос нашему Шефу или Учётчику</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <strong>Шеф-повар:</strong>
                <p className="text-xs mt-1">Рецепты, кулинария, меню</p>
              </div>
              <div className="p-3 border rounded-lg">
                <strong>Учётчик:</strong>
                <p className="text-xs mt-1">Финансы, отчёты, статистика</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <Card className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-muted rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </Card>
  )
}