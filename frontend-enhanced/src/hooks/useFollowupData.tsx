import { useState, useEffect } from 'react';
import { FollowupTask } from '@/components/ui/FollowupTaskItem';

export interface UseFollowupDataReturn {
  tasks: FollowupTask[];
  isLoading: boolean;
  error: Error | null;
  refetchTasks: () => void;
}

// Mock data for demonstration
const mockTasks: FollowupTask[] = [
  {
    id: '1',
    title: 'Обновить меню на следующей неделе',
    description: 'Добавить новые сезонные блюда и обновить цены',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Связаться с поставщиком овощей',
    description: 'Обсудить поставки органических овощей',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Проверить инвентарь специй',
    description: 'Убедиться, что все специи свежие и в наличии',
    status: 'completed',
    priority: 'low',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(),
  },
];

export const useFollowupData = (): UseFollowupDataReturn => {
  const [tasks, setTasks] = useState<FollowupTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTasks(mockTasks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setIsLoading(false);
    }
  };

  const refetchTasks = () => {
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    refetchTasks,
  };
};