'use client'

import { useState, useEffect } from 'react'
import { ChefHat, Calculator, Brain, Send, Loader2, Activity } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  agent?: string
  model?: string
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  description: string
  model: string
  capabilities: string[]
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [health, setHealth] = useState<any>(null)

  const API_URL = 'http://localhost:5001'

  useEffect(() => {
    // Load agents
    fetch(`${API_URL}/api/agent/agents`)
      .then(res => res.json())
      .then(data => setAgents(data.agents))
      .catch(console.error)

    // Check health
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(console.error)
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      let accumulatedContent = ''
      let currentAgent = ''
      let currentModel = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

        for (const line of lines) {
          const data = line.replace('data:', '').trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'metadata') {
              currentAgent = parsed.agent || ''
              currentModel = parsed.model || ''
            } else if (parsed.type === 'content' && parsed.content) {
              accumulatedContent += parsed.content
            }
          } catch (e) {}
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: accumulatedContent,
        role: 'assistant',
        agent: currentAgent,
        model: currentModel,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Произошла ошибка. Попробуйте еще раз.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case 'chef': return <ChefHat className="h-4 w-4" />
      case 'accountant': return <Calculator className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getAgentName = (agent?: string) => {
    switch (agent) {
      case 'chef': return 'Шеф-повар'
      case 'accountant': return 'Учётчик'
      default: return 'Ассистент'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chef's Mind AI</h1>
                <p className="text-sm text-gray-600">Умная система управления рестораном</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {health ? (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Activity className="h-4 w-4" />
                  Система активна
                </div>
              ) : (
                <div className="text-sm text-red-600">Система недоступна</div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Agents Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Доступные агенты</h2>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getAgentIcon(agent.id)}
                      <h3 className="font-medium">{agent.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                    <div className="text-xs text-gray-500">
                      Модель: <span className="font-medium">{agent.model}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.capabilities.map((cap, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Как это работает</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>1. Оркестратор:</strong> анализирует ваш запрос
                </div>
                <div>
                  <strong>2. Выбор агента:</strong> направляет к нужному специалисту
                </div>
                <div>
                  <strong>3. Ответ:</strong> агент предоставляет экспертную помощь
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Чат с AI-агентами</h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Задайте вопрос нашему Шефу или Учётчику</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="border rounded-lg p-3">
                        <strong>Шеф-повар:</strong>
                        <p className="text-xs mt-1">Рецепты, кулинария, меню</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <strong>Учётчик:</strong>
                        <p className="text-xs mt-1">Финансы, отчёты, статистика</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {getAgentIcon(message.agent)}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        {message.role === 'assistant' && message.agent && (
                          <div className="text-xs text-gray-500 mb-1">
                            {getAgentName(message.agent)} • {message.model}
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {message.timestamp.toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                          U
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Введите ваше сообщение..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}