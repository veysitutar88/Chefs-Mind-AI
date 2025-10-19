"use client";
import { useState } from "react";
import GoogleConnect from "../components/GoogleConnect";
import StatusDashboard from "../components/StatusDashboard";
import Chat from "../components/Chat";
import AgentSelector from "../components/AgentSelector";

export default function Page() {
  const [selectedAgent, setSelectedAgent] = useState<string>("Chef");

  const handleAgentSelect = (agent: string) => {
    setSelectedAgent(agent);
    console.log("Выбран агент:", agent);
    // Здесь можно добавить логику для отправки выбранного агента на сервер
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chef's Mind — Enhanced Console</h1>
      <p className="text-sm text-gray-600">E2E smoke: proxy /health</p>
      <a className="underline text-blue-600" href="/health" target="_blank">
        /health
      </a>
      <StatusDashboard />
      <GoogleConnect />
      <AgentSelector onAgentSelect={handleAgentSelect} />
      <Chat selectedAgent={selectedAgent} />
    </main>
  );
}