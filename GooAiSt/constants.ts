import { AgentConfig } from './types';

export const AGENTS: AgentConfig[] = [
  {
    id: 'sous_chef',
    title: 'SousChef AI',
    subtitle: 'Assists with recipes, plating, and prep sheets',
    iconName: 'chef_hat'
  },
  {
    id: 'gastro_count',
    title: 'GastroCount AI',
    subtitle: 'Financial assistant: costs, reports, analysis',
    iconName: 'calculator'
  },
  {
    id: 'gastro_mind',
    title: 'GastroMind AI',
    subtitle: 'Knowledge guide: research, trends, insights',
    iconName: 'compass'
  },
  {
    id: 'food_frame',
    title: 'FoodFrame AI (Media Studio)',
    subtitle: 'Food visuals, photos, videos',
    iconName: 'image'
  }
];

export const INITIAL_FILES = [
  { id: '1', name: 'Summer_Menu_Draft.pdf', type: 'pdf', date: '2h ago' },
  { id: '2', name: 'Plating_Concept_04.jpg', type: 'image', date: '1d ago' },
  { id: '3', name: 'Inventory_Report_Aug.xlsx', type: 'doc', date: '2d ago' },
] as const;
