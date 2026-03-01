export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string | null;
}

export interface TaskUpdate extends Partial<TaskInput> {
  completed?: boolean;
}
