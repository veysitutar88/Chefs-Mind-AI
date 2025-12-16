import { AgentId } from "../types";

// Simulating the backend response shape described in the prompt
interface ApiResponse {
  reply: string;
  agentId: AgentId;
  sessionId: string;
  meta: {
    tokens: { input: number; output: number };
    latencyMs: number;
  };
}

const MOCK_RESPONSES: Record<AgentId, string[]> = {
  sous_chef: [
    "I can certainly help you design a gluten-free alternative for that dish. Shall we start with the flour blend?",
    "The standard prep time for a Beef Wellington is approximately 45 minutes active work. I've generated a prep sheet.",
    "For plating the scallop ceviche, I recommend a radial arrangement with micro-cilantro accents."
  ],
  gastro_count: [
    "Based on current supplier prices, your food cost for this menu item is sitting at 32%. We should aim for 28%.",
    "I've analyzed the P&L from last month. Labor costs were 5% higher than projected on weekends.",
    "Here is the breakdown of the ingredient yield for the new wagyu shipment."
  ],
  gastro_mind: [
    "Fermentation is currently trending heavily in Nordic cuisine. Here are three key techniques...",
    "The history of this spice blend dates back to the 17th century trade routes. Would you like a deep dive?",
    "Molecular gastronomy suggests using agar-agar here for a more heat-stable gel."
  ],
  food_frame: [
    "I'm ready to generate visuals. Please describe the lighting and angle you prefer.",
    "Video generation requires a specific prompt about movement. Is the steam rising or is the sauce being poured?",
    "Accessing the media gallery. You have 14 new assets from yesterday's session."
  ]
};

export const sendMessageToApi = async (agentId: AgentId, message: string, sessionId: string): Promise<ApiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = MOCK_RESPONSES[agentId];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      resolve({
        reply: randomResponse,
        agentId: agentId,
        sessionId: sessionId,
        meta: {
          tokens: { input: message.length, output: randomResponse.length },
          latencyMs: 450
        }
      });
    }, 800 + Math.random() * 1000); // Simulate network latency 0.8s - 1.8s
  });
};

export const generateMediaApi = async (type: 'image' | 'video', prompt: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Started ${type} generation job for: "${prompt}"`);
        }, 1200);
    });
};
