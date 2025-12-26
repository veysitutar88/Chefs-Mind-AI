import { AGENT_CANON } from '@/config/agents';
import { AgentConfig } from '@/types/ui';

export const AGENTS: AgentConfig[] = [
    {
        id: AGENT_CANON.souschef.id,
        title: AGENT_CANON.souschef.label,
        subtitle: AGENT_CANON.souschef.subtitle,
        iconName: AGENT_CANON.souschef.iconName,
        icon: AGENT_CANON.souschef.icon
    },
    {
        id: AGENT_CANON.gastrocount.id,
        title: AGENT_CANON.gastrocount.label,
        subtitle: AGENT_CANON.gastrocount.subtitle,
        iconName: AGENT_CANON.gastrocount.iconName,
        icon: AGENT_CANON.gastrocount.icon
    },
    {
        id: AGENT_CANON.gastromind.id,
        title: AGENT_CANON.gastromind.label,
        subtitle: AGENT_CANON.gastromind.subtitle,
        iconName: AGENT_CANON.gastromind.iconName,
        icon: AGENT_CANON.gastromind.icon
    },
    {
        id: AGENT_CANON.foodframe.id,
        title: AGENT_CANON.foodframe.label,
        subtitle: AGENT_CANON.foodframe.subtitle,
        iconName: AGENT_CANON.foodframe.iconName,
        icon: AGENT_CANON.foodframe.icon
    }
];

export const INITIAL_FILES = [
    { id: '1', name: 'Summer_Menu_Draft.pdf', type: 'pdf', date: '2h ago' },
    { id: '2', name: 'Plating_Concept_04.jpg', type: 'image', date: '1d ago' },
    { id: '3', name: 'Inventory_Report_Aug.xlsx', type: 'doc', date: '2d ago' },
] as const;
