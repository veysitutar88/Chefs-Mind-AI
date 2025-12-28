'use client';

import { AppLayout } from '../../../components/layout/AppLayout';
import { FoodFrameStudio } from '../../../components/chat/FoodFrameStudio';
import { AGENT_CANON } from '@/config/agents';

export default function FoodFramePage() {
  const agent = AGENT_CANON.foodframe;

  return (
    <AppLayout currentAgent={agent.id}>
      <FoodFrameStudio />
    </AppLayout>
  );
}
