import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Calculator, Bot } from 'lucide-react'
import { Agent } from '@/types/chat'
import { getAgents } from '@/lib/api'

export function AgentSelector() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await getAgents()
        setAgents(data)
      } catch (error) {
        console.error('Error loading agents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'chef':
        return <ChefHat className="h-6 w-6" />
      case 'accountant':
        return <Calculator className="h-6 w-6" />
      default:
        return <Bot className="h-6 w-6" />
    }
  }

  const getModelColor = (model: string) => {
    if (model.includes('gpt')) return 'bg-green-100 text-green-800'
    if (model.includes('gemini')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {agents.map((agent) => (
        <Card key={agent.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              {getAgentIcon(agent.id)}
              <CardTitle className="text-lg">{agent.name}</CardTitle>
            </div>
            <CardDescription>{agent.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Модель:</span>
                <Badge variant="secondary" className={getModelColor(agent.model)}>
                  {agent.model}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Возможности:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.capabilities.map((capability, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}