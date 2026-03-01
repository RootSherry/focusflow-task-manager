import type { TaskItemComponentProps } from './taskTypes';
import { TASK_PRIORITY_LABEL } from './taskTypes';
import { formatDueDate } from './taskUtils';

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemComponentProps) {
  const handleDelete = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('确认删除该任务吗？');
      if (!confirmed) {
        return;
      }
    }

    onDelete(task.id);
  };

  return (
    <article className={`task-item priority-${task.priority} ${task.completed ? 'is-completed' : ''}`}>
      <div className="task-item-top">
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            aria-label={`完成任务：${task.title}`}
          />
          <h3 className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</h3>
        </label>
      </div>

      {task.description ? <p style={{ margin: '0.45rem 0 0', color: '#334155' }}>{task.description}</p> : null}

      <div className="task-meta">
        <span>优先级：{TASK_PRIORITY_LABEL[task.priority]}</span>
        <span>截止：{task.dueDate ? formatDueDate(task.dueDate) : '无'}</span>
      </div>

      <div className="task-actions">
        <button type="button" onClick={() => onEdit(task)}>
          编辑
        </button>
        <button type="button" onClick={handleDelete}>
          删除
        </button>
      </div>
    </article>
  );
}
