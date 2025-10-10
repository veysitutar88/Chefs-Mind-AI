'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { AgentSelector } from '@/components/AgentSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, MessageSquare, Activity } from 'lucide-react'
import { checkHealth } from '@/lib/api'

export default function Home() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await checkHealth()
        setHealth(data)
      } catch (error) {
        console.error('Error checking health:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHealth()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Chef's Mind AI</h1>
                <p className="text-sm text-muted-foreground">
                  Умная система управления рестораном с AI-агентами
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <Badge variant="outline">Проверка...</Badge>
              ) : health ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Система активна
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Система недоступна
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info and Agents */}
          <div className="lg:col-span-1 space-y-6">
            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Архитектура агентов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Оркестратор:</strong>
                    <p className="text-muted-foreground">Анализирует запросы и направляет к нужному специалисту</p>
                  </div>
                  <div>
                    <strong>Шеф-повар:</strong>
                    <p className="text-muted-foreground">Эксперт по кулинарии, рецептам и управлению кухней</p>
                  </div>
                  <div>
                    <strong>Учётчик:</strong>
                    <p className="text-muted-foreground">Финансовый специалист по отчётности и анализу</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Agents */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Доступные агенты
              </h2>
              <AgentSelector />
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Чат с AI-агентами</h2>
              <ChatInterface />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Chef's Mind AI - Демонстрация архитектуры мультиагентной системы</p>
            <p className="mt-1">Powered by LangGraph.js, Next.js, shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  )
}