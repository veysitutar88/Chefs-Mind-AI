import { apiRequest } from "./queryClient";

export const api = {
  // Chat operations
  async createChatSession(agentType: string, title?: string) {
    const res = await apiRequest("POST", "/api/chat/sessions", {
      agentType,
      title
    });
    const json = await res.json();
    return json; // Returns full response with .data property
  },

  async getChatSessions() {
    const res = await apiRequest("GET", "/api/chat/sessions");
    const json = await res.json();
    return json; // Returns full response with .data property
  },

  async getMessages(sessionId: string) {
    const res = await apiRequest("GET", `/api/chat/sessions/${sessionId}/messages`);
    const json = await res.json();
    return json; // Returns full response with .data property
  },

  async sendMessage(sessionId: string, content: string, metadata?: any) {
    // Spread metadata to top level for backend compatibility
    const requestBody = {
      sessionId,
      role: 'user',
      content,
      ...metadata  // Spread mediaType, model to top level
    };
    
    const res = await apiRequest("POST", "/api/chat/messages", requestBody);
    const json = await res.json();
    return json; // Returns full response with .data property
  },

  // File operations
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
    
    return res.json();
  },

  async getUploads() {
    const res = await apiRequest("GET", "/api/uploads");
    return res.json();
  },

  // Generated content
  async getGeneratedContent() {
    const res = await apiRequest("GET", "/api/generated-content");
    return res.json();
  },

  // SQL validation
  async validateSQL(query: string) {
    const res = await apiRequest("POST", "/api/validate-sql", { query });
    return res.json();
  },

  // Agent settings
  async getAgentSettings() {
    const res = await apiRequest("GET", "/api/agent-settings");
    return res.json();
  },

  async createAgentSettings(data: { agentType: string; systemPrompt: string }) {
    const res = await apiRequest("POST", "/api/agent-settings", data);
    return res.json();
  },

  async updateAgentSettings(id: string, data: { systemPrompt: string }) {
    const res = await apiRequest("PUT", `/api/agent-settings/${id}`, data);
    return res.json();
  }
};
