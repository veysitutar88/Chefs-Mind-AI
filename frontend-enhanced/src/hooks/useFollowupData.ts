import { useState, useEffect } from 'react';

export type FollowupStatus = 'pending' | 'in_progress' | 'completed';

export type FollowupPriority = 'low' | 'medium' | 'high';

export interface FollowupTask {
  id: string;
  title: string;
  description?: string;
  status: FollowupStatus;
  priority: FollowupPriority;
  dueDate: Date;
  createdAt?: Date;
  assignee?: string | null;
  sourceAgent?: string | null;
}

export interface FollowupError {
  message: string;
}

export const useFollowupData = () => {
  const [tasks, setTasks] = useState<FollowupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FollowupError | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/followups');
      if (!response.ok) {
        throw new Error('Failed to fetch follow-up tasks');
      }
      const data = await response.json();
      const parsedTasks: FollowupTask[] = data.tasks.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
      }));
      setTasks(parsedTasks);
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const refetchTasks = () => {
    fetchTasks();
  };

  return { tasks, loading, error, refetchTasks };
};