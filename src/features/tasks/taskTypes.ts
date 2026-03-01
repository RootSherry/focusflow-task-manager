import type { Task, TaskInput, TaskPriority, TaskUpdate } from '../../types/task';

export type TaskFormMode = 'create' | 'edit';

export interface TaskFormComponentProps {
  mode?: TaskFormMode;
  initialValues?: Partial<TaskInput>;
  submitText?: string;
  onSubmit: (values: TaskInput) => void;
  onCancel?: () => void;
  className?: string;
}

export interface TaskItemComponentProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export interface TaskListComponentProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, patch: TaskUpdate) => void;
}

export interface UseTasksResult {
  tasks: Task[];
  addTask: (input: TaskInput) => void;
  editTask: (taskId: string, patch: TaskUpdate) => void;
  removeTask: (taskId: string) => void;
  toggleTask: (taskId: string, completed?: boolean) => void;
  clearCompleted: () => void;
}

export const TASK_PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};
