import { toLocalDateKey } from '../../shared/date';
import type { Task, TaskInput, TaskPriority, TaskUpdate } from '../../types/task';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function parseDateParts(value: string): [number, number, number] {
  const [yearPart = '', monthPart = '', dayPart = ''] = value.split('-');
  return [Number(yearPart), Number(monthPart), Number(dayPart)];
}

export const isTaskPriority = (value: unknown): value is TaskPriority =>
  value === 'low' || value === 'medium' || value === 'high';

export const isValidDateString = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = parseDateParts(value);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
};

export const normalizeDueDate = (dueDate: string | null | undefined): string | null => {
  if (dueDate === null || dueDate === undefined) {
    return null;
  }

  const normalized = dueDate.trim();
  if (!normalized) {
    return null;
  }

  if (!isValidDateString(normalized)) {
    throw new Error('截止日期格式无效，应为 YYYY-MM-DD');
  }

  return normalized;
};

export const normalizeTaskInput = (input: TaskInput): TaskInput => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('任务标题不能为空');
  }

  const description = input.description?.trim();
  const priority = isTaskPriority(input.priority) ? input.priority : 'medium';
  const dueDate = normalizeDueDate(input.dueDate);

  return {
    title,
    description: description ? description : undefined,
    priority,
    dueDate,
  };
};

export const createTaskId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const createTask = (
  input: TaskInput,
  options: { id?: string; now?: Date } = {},
): Task => {
  const normalized = normalizeTaskInput(input);
  const now = (options.now ?? new Date()).toISOString();

  return {
    id: options.id ?? createTaskId(),
    title: normalized.title,
    description: normalized.description,
    completed: false,
    priority: normalized.priority,
    dueDate: normalized.dueDate,
    createdAt: now,
    updatedAt: now,
  };
};

function resolveCompletedAt(task: Task, nextCompleted: boolean, nowIso: string): string | undefined {
  if (nextCompleted) {
    return task.completed ? task.completedAt : nowIso;
  }
  return undefined;
}

export const updateTask = (
  task: Task,
  patch: TaskUpdate,
  options: { now?: Date } = {},
): Task => {
  const nextTitle = patch.title !== undefined ? patch.title.trim() : task.title;
  if (!nextTitle) {
    throw new Error('任务标题不能为空');
  }

  const nextDueDate =
    patch.dueDate !== undefined ? normalizeDueDate(patch.dueDate) : task.dueDate;

  const nextPriority =
    patch.priority !== undefined
      ? isTaskPriority(patch.priority)
        ? patch.priority
        : task.priority
      : task.priority;

  const nextDescription =
    patch.description !== undefined
      ? patch.description.trim() || undefined
      : task.description;

  const nextCompleted = patch.completed ?? task.completed;
  const nowIso = (options.now ?? new Date()).toISOString();

  return {
    ...task,
    title: nextTitle,
    description: nextDescription,
    completed: nextCompleted,
    priority: nextPriority,
    dueDate: nextDueDate,
    completedAt: resolveCompletedAt(task, nextCompleted, nowIso),
    updatedAt: nowIso,
  };
};

const dueDateWeight = (dueDate: string | null): number => {
  if (!dueDate) {
    return Number.POSITIVE_INFINITY;
  }

  const [year, month, day] = parseDateParts(dueDate);
  return Date.UTC(year, month - 1, day);
};

export const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const dueDateDiff = dueDateWeight(a.dueDate) - dueDateWeight(b.dueDate);
    if (dueDateDiff !== 0) {
      return dueDateDiff;
    }

    const createdDiff = Date.parse(b.createdAt) - Date.parse(a.createdAt);
    if (!Number.isNaN(createdDiff) && createdDiff !== 0) {
      return createdDiff;
    }

    return a.id.localeCompare(b.id);
  });
};

export const addTaskToList = (
  tasks: Task[],
  input: TaskInput,
  options: { id?: string; now?: Date } = {},
): Task[] => {
  const nextTask = createTask(input, options);
  return sortTasks([...tasks, nextTask]);
};

export const editTaskInList = (
  tasks: Task[],
  taskId: string,
  patch: TaskUpdate,
  options: { now?: Date } = {},
): Task[] => {
  let updated = false;

  const nextTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    updated = true;
    return updateTask(task, patch, options);
  });

  return updated ? sortTasks(nextTasks) : tasks;
};

export const removeTaskFromList = (tasks: Task[], taskId: string): Task[] => {
  if (!tasks.some((task) => task.id === taskId)) {
    return tasks;
  }

  return tasks.filter((task) => task.id !== taskId);
};

export const toggleTaskInList = (
  tasks: Task[],
  taskId: string,
  completed?: boolean,
  options: { now?: Date } = {},
): Task[] => {
  let updated = false;

  const nextTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    updated = true;
    return updateTask(task, { completed: completed ?? !task.completed }, options);
  });

  return updated ? sortTasks(nextTasks) : tasks;
};

export const isTask = (value: unknown): value is Task => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const task = value as Record<string, unknown>;

  const hasValidDates =
    typeof task.createdAt === 'string' &&
    !Number.isNaN(Date.parse(task.createdAt)) &&
    typeof task.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(task.updatedAt));

  const hasValidCompletedAt =
    task.completedAt === undefined ||
    (typeof task.completedAt === 'string' && !Number.isNaN(Date.parse(task.completedAt)));

  const hasValidDueDate =
    task.dueDate === null ||
    (typeof task.dueDate === 'string' && isValidDateString(task.dueDate));

  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    (task.description === undefined || typeof task.description === 'string') &&
    typeof task.completed === 'boolean' &&
    isTaskPriority(task.priority) &&
    hasValidDueDate &&
    hasValidDates &&
    hasValidCompletedAt
  );
};

export const formatDueDate = (dueDate: string, locale = 'zh-CN'): string => {
  if (!isValidDateString(dueDate)) {
    return dueDate;
  }

  const [year, month, day] = parseDateParts(dueDate);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const getTodayCompletedTaskCount = (tasks: Task[], now = new Date()): number => {
  const todayKey = toLocalDateKey(now);
  return tasks.reduce((count, task) => {
    if (!task.completed || !task.completedAt) {
      return count;
    }
    return toLocalDateKey(task.completedAt) === todayKey ? count + 1 : count;
  }, 0);
};
