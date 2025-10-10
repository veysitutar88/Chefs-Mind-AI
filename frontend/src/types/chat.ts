export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  agent?: string
  model?: string
  timestamp: Date
  metadata?: any
}

export interface Agent {
  id: string
  name: string
  description: string
  model: string
  capabilities: string[]
}

export interface StreamChunk {
  type: 'content' | 'metadata' | 'error' | 'complete'
  data?: any
  content?: string
  agent?: string
  model?: string
  error?: string
}