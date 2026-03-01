import { useMemo, useState } from 'react';
import type { TaskInput } from '../../types/task';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';
import type { TaskListComponentProps } from './taskTypes';
import { sortTasks } from './taskUtils';

export function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListComponentProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const orderedTasks = useMemo(() => sortTasks(tasks), [tasks]);

  const handleEditSubmit = (taskId: string, values: TaskInput) => {
    onEdit(taskId, values);
    setEditingTaskId(null);
  };

  if (orderedTasks.length === 0) {
    return <p style={{ color: '#64748b', margin: 0 }}>暂无任务，先添加一个吧。</p>;
  }

  return (
    <ul className="task-list">
      {orderedTasks.map((task) => (
        <li key={task.id}>
          {editingTaskId === task.id ? (
            <TaskForm
              mode="edit"
              initialValues={task}
              submitText="保存修改"
              onSubmit={(values) => handleEditSubmit(task.id, values)}
              onCancel={() => setEditingTaskId(null)}
              className="task-form"
            />
          ) : (
            <TaskItem
              task={task}
              onToggle={onToggle}
              onDelete={(taskId) => {
                if (editingTaskId === taskId) {
                  setEditingTaskId(null);
                }
                onDelete(taskId);
              }}
              onEdit={(currentTask) => setEditingTaskId(currentTask.id)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
