import { useMemo } from 'react';
import { FocusTimer } from './features/focus/FocusTimer';
import { TaskForm } from './features/tasks/TaskForm';
import { TaskList } from './features/tasks/TaskList';
import { useTasks } from './features/tasks/useTasks';
import { getTodayCompletedTaskCount } from './features/tasks/taskUtils';
import './App.css';

function App() {
  const { tasks, addTask, editTask, removeTask, toggleTask, clearCompleted } = useTasks();

  const todayCompletedTasks = useMemo(() => getTodayCompletedTaskCount(tasks), [tasks]);

  return (
    <div className="app-shell">
      <header className="hero">
        <h1>FocusFlow 专注任务管理器</h1>
        <p>任务清单 + 番茄钟 + 本地统计，一站式管理你的专注节奏。</p>
      </header>

      <main className="main-grid">
        <section className="panel tasks-panel">
          <div className="panel-head">
            <h2>任务管理</h2>
            <button type="button" onClick={clearCompleted} className="ghost-btn">
              清除已完成
            </button>
          </div>

          <TaskForm
            mode="create"
            submitText="新增任务"
            onSubmit={addTask}
            className="task-form task-form-create"
          />

          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={removeTask}
            onEdit={editTask}
          />
        </section>

        <section className="panel focus-panel">
          <FocusTimer todayCompletedTasks={todayCompletedTasks} />
        </section>
      </main>
    </div>
  );
}

export default App;
