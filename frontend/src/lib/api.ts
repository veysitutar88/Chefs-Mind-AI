import { Message, Agent, StreamChunk } from '@/types/chat'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export async function sendMessage(message: string): Promise<{
  messages: Message[]
  agent?: string
  model?: string
}> {
  const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No response body')
  }

  let accumulatedContent = ''
  let currentAgent = ''
  let currentModel = ''
  let metadata: any = null

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'))

      for (const line of lines) {
        const data = line.replace('data:', '').trim()
        if (data === '[DONE]') {
          break
        }

        try {
          const parsed = JSON.parse(data) as StreamChunk
          
          if (parsed.type === 'metadata') {
            currentAgent = parsed.agent || ''
            currentModel = parsed.model || ''
            metadata = parsed.data
          } else if (parsed.type === 'content' && parsed.content) {
            accumulatedContent += parsed.content
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  const userMessage: Message = {
    id: Date.now().toString(),
    content: message,
    role: 'user',
    timestamp: new Date()
  }

  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    content: accumulatedContent,
    role: 'assistant',
    agent: currentAgent,
    model: currentModel,
    timestamp: new Date(),
    metadata
  }

  return {
    messages: [userMessage, assistantMessage],
    agent: currentAgent,
    model: currentModel
  }
}

export async function getAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_BASE_URL}/api/agent/agents`)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.agents
}

export async function checkHealth(): Promise<{
  status: string
  version: string
  agents: string[]
  timestamp: string
}> {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}