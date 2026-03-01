import { getBrowserStorage, safeReadJSON, safeRemove, safeWriteJSON, type StorageLike } from '../../shared/storage';
import type { Task } from '../../types/task';
import { isTask, sortTasks } from './taskUtils';

export const TASKS_STORAGE_KEY = 'focusflow.tasks.v1';

export const loadTasksFromStorage = (
  storageKey: string = TASKS_STORAGE_KEY,
  storage: StorageLike | null = getBrowserStorage(),
): Task[] => {
  const parsed = safeReadJSON<unknown>(storage, storageKey);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return sortTasks(parsed.filter(isTask));
};

export const saveTasksToStorage = (
  tasks: Task[],
  storageKey: string = TASKS_STORAGE_KEY,
  storage: StorageLike | null = getBrowserStorage(),
): boolean => {
  if (tasks.length === 0) {
    return safeRemove(storage, storageKey);
  }
  return safeWriteJSON(storage, storageKey, tasks);
};
