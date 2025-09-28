import { apiRequest } from "./queryClient";

export const api = {
  // Chat operations
  async createChatSession(agentType: string, title?: string) {
    const res = await apiRequest("POST", "/api/chat/sessions", {
      agentType,
      title
    });
    return res.json();
  },

  async getChatSessions() {
    const res = await apiRequest("GET", "/api/chat/sessions");
    return res.json();
  },

  async getMessages(sessionId: string) {
    const res = await apiRequest("GET", `/api/chat/sessions/${sessionId}/messages`);
    return res.json();
  },

  async sendMessage(sessionId: string, content: string, metadata?: any) {
    // Spread metadata to top level for backend compatibility
    const requestBody = {
      sessionId,
      role: 'user',
      content,
      ...metadata  // Spread mediaType, model to top level
    };
    
    console.log('🚀 API.ts - Sending request body:', JSON.stringify(requestBody, null, 2));
    console.log('🚀 API.ts - Metadata received:', metadata);
    
    const res = await apiRequest("POST", "/api/chat/messages", requestBody);
    return res.json();
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
  }
};
