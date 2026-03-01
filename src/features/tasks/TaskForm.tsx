import { useEffect, useState, type FormEvent } from 'react';
import type { TaskInput, TaskPriority } from '../../types/task';
import type { TaskFormComponentProps } from './taskTypes';
import { TASK_PRIORITY_OPTIONS } from './taskTypes';
import { isTaskPriority, isValidDateString } from './taskUtils';

type TaskFormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
};

const buildInitialState = (initialValues?: Partial<TaskInput>): TaskFormState => ({
  title: initialValues?.title ?? '',
  description: initialValues?.description ?? '',
  priority: isTaskPriority(initialValues?.priority) ? initialValues.priority : 'medium',
  dueDate: initialValues?.dueDate ?? '',
});

export function TaskForm({
  mode = 'create',
  initialValues,
  submitText,
  onSubmit,
  onCancel,
  className,
}: TaskFormComponentProps) {
  const [form, setForm] = useState<TaskFormState>(() => buildInitialState(initialValues));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildInitialState(initialValues));
    setError(null);
  }, [initialValues]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) {
      setError('任务标题不能为空');
      return;
    }

    if (form.dueDate && !isValidDateString(form.dueDate)) {
      setError('截止日期格式无效');
      return;
    }

    const payload: TaskInput = {
      title,
      description: form.description.trim() || undefined,
      priority: form.priority,
      dueDate: form.dueDate || null,
    };

    onSubmit(payload);

    if (mode === 'create') {
      setForm(buildInitialState());
    }

    setError(null);
  };

  return (
    <form className={className ?? 'task-form'} onSubmit={handleSubmit}>
      <div>
        <label htmlFor="task-title">标题</label>
        <input
          id="task-title"
          type="text"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="例如：完成需求评审"
          required
        />
      </div>

      <div>
        <label htmlFor="task-description">描述</label>
        <textarea
          id="task-description"
          rows={2}
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="可选：补充任务细节"
        />
      </div>

      <div>
        <label htmlFor="task-priority">优先级</label>
        <select
          id="task-priority"
          value={form.priority}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              priority: event.target.value as TaskPriority,
            }))
          }
        >
          {TASK_PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="task-due-date">截止日期</label>
        <input
          id="task-due-date"
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
        />
      </div>

      {error ? (
        <p role="alert" style={{ color: '#b42318', margin: 0 }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="ghost-btn">
            取消
          </button>
        ) : null}
        <button type="submit">{submitText ?? (mode === 'edit' ? '保存' : '新增任务')}</button>
      </div>
    </form>
  );
}
