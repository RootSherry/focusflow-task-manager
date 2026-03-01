import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Task, TaskInput, TaskUpdate } from '../../types/task';
import {
  TASKS_STORAGE_KEY,
  loadTasksFromStorage,
  saveTasksToStorage,
} from './taskStorage';
import type { UseTasksResult } from './taskTypes';
import {
  addTaskToList,
  editTaskInList,
  removeTaskFromList,
  sortTasks,
  toggleTaskInList,
} from './taskUtils';

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage(TASKS_STORAGE_KEY));

  useEffect(() => {
    saveTasksToStorage(tasks, TASKS_STORAGE_KEY);
  }, [tasks]);

  const addTask = useCallback((input: TaskInput) => {
    setTasks((prev) => addTaskToList(prev, input));
  }, []);

  const editTask = useCallback((taskId: string, patch: TaskUpdate) => {
    setTasks((prev) => editTaskInList(prev, taskId, patch));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) => removeTaskFromList(prev, taskId));
  }, []);

  const toggleTask = useCallback((taskId: string, completed?: boolean) => {
    setTasks((prev) => toggleTaskInList(prev, taskId, completed));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  }, []);

  const orderedTasks = useMemo(() => sortTasks(tasks), [tasks]);

  return {
    tasks: orderedTasks,
    addTask,
    editTask,
    removeTask,
    toggleTask,
    clearCompleted,
  };
}
