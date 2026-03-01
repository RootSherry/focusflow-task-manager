import { describe, expect, it } from 'vitest';
import type { Task } from '../../../types/task';
import {
  addTaskToList,
  createTask,
  editTaskInList,
  getTodayCompletedTaskCount,
  removeTaskFromList,
  sortTasks,
  toggleTaskInList,
  updateTask,
} from '../taskUtils';

const baseTime = new Date('2026-02-01T10:00:00.000Z');

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-default',
  title: '默认任务',
  description: undefined,
  completed: false,
  priority: 'medium',
  dueDate: null,
  createdAt: baseTime.toISOString(),
  updatedAt: baseTime.toISOString(),
  completedAt: undefined,
  ...overrides,
});

describe('taskUtils', () => {
  it('createTask 会标准化输入并生成任务', () => {
    const now = new Date('2026-02-02T08:30:00.000Z');
    const task = createTask(
      {
        title: '  完成排期  ',
        description: '  输出迭代计划  ',
        priority: 'high',
        dueDate: '2026-02-10',
      },
      { id: 'task-1', now },
    );

    expect(task).toEqual({
      id: 'task-1',
      title: '完成排期',
      description: '输出迭代计划',
      completed: false,
      priority: 'high',
      dueDate: '2026-02-10',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('updateTask 支持编辑字段与完成状态', () => {
    const original = makeTask({
      id: 'task-2',
      title: '原任务',
      description: '原描述',
      dueDate: '2026-02-12',
      priority: 'low',
    });
    const now = new Date('2026-02-03T11:00:00.000Z');

    const updated = updateTask(
      original,
      {
        title: '  新任务名  ',
        description: '  新描述  ',
        priority: 'high',
        dueDate: '2026-02-15',
        completed: true,
      },
      { now },
    );

    expect(updated.title).toBe('新任务名');
    expect(updated.description).toBe('新描述');
    expect(updated.priority).toBe('high');
    expect(updated.completed).toBe(true);
    expect(updated.dueDate).toBe('2026-02-15');
    expect(updated.updatedAt).toBe(now.toISOString());
    expect(updated.completedAt).toBe(now.toISOString());
  });

  it('列表操作支持新增/编辑/删除/完成', () => {
    let tasks: Task[] = [];

    tasks = addTaskToList(
      tasks,
      {
        title: '任务A',
        description: '',
        priority: 'medium',
        dueDate: null,
      },
      { id: 'a', now: new Date('2026-02-01T00:00:00.000Z') },
    );

    tasks = addTaskToList(
      tasks,
      {
        title: '任务B',
        priority: 'high',
        dueDate: '2026-02-05',
        description: '重要任务',
      },
      { id: 'b', now: new Date('2026-02-01T01:00:00.000Z') },
    );

    tasks = editTaskInList(
      tasks,
      'a',
      { priority: 'high', dueDate: '2026-02-04' },
      { now: new Date('2026-02-02T00:00:00.000Z') },
    );

    expect(tasks.find((item) => item.id === 'a')?.priority).toBe('high');
    expect(tasks.find((item) => item.id === 'a')?.dueDate).toBe('2026-02-04');

    tasks = toggleTaskInList(tasks, 'a', true, {
      now: new Date('2026-02-03T00:00:00.000Z'),
    });
    expect(tasks.find((item) => item.id === 'a')?.completed).toBe(true);

    tasks = removeTaskFromList(tasks, 'b');
    expect(tasks.map((item) => item.id)).toEqual(['a']);
  });

  it('sortTasks 规则：未完成优先，其次优先级，其次截止日期', () => {
    const sorted = sortTasks([
      makeTask({
        id: '1',
        title: '低优先级',
        priority: 'low',
        dueDate: '2026-02-01',
        completed: false,
      }),
      makeTask({
        id: '2',
        title: '高优先级-晚',
        priority: 'high',
        dueDate: '2026-03-01',
        completed: false,
      }),
      makeTask({
        id: '3',
        title: '高优先级-早',
        priority: 'high',
        dueDate: '2026-02-02',
        completed: false,
      }),
      makeTask({
        id: '4',
        title: '已完成',
        priority: 'high',
        dueDate: '2026-01-01',
        completed: true,
      }),
    ]);

    expect(sorted.map((task) => task.id)).toEqual(['3', '2', '1', '4']);
  });

  it('getTodayCompletedTaskCount 仅统计今日完成任务', () => {
    const today = new Date('2026-02-28T12:00:00.000Z');
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tasks: Task[] = [
      makeTask({ id: 'a', completed: true, completedAt: today.toISOString() }),
      makeTask({ id: 'b', completed: true, completedAt: yesterday.toISOString() }),
      makeTask({ id: 'c', completed: false }),
    ];

    expect(getTodayCompletedTaskCount(tasks, today)).toBe(1);
  });
});
