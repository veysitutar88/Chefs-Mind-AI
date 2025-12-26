export const AGENT_CANON = {
    souschef: {
        id: 'souschef' as const,
        label: 'SousChef',
        subtitle: 'Recipes • Prep • Plating',
        icon: '👨‍🍳',
        iconName: 'chef_hat' as const,
    },
    gastrocount: {
        id: 'gastrocount' as const,
        label: 'GastroCount',
        subtitle: 'Costs • Inventory • Reports',
        icon: '🧮',
        iconName: 'calculator' as const,
    },
    gastromind: {
        id: 'gastromind' as const,
        label: 'GastroMind',
        subtitle: 'Research • Trends • Insights',
        icon: '🔍',
        iconName: 'compass' as const,
    },
    foodframe: {
        id: 'foodframe' as const,
        label: 'FoodFrame',
        subtitle: 'Photos • Video • Creative',
        icon: '🎨',
        iconName: 'image' as const,
    },
};

export const AGENTS_ARRAY = Object.values(AGENT_CANON);
