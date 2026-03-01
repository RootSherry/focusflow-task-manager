import { formatMinutesLabel } from '../focus/focusUtils';

export interface StatsPanelProps {
  todayCompletedTasks: number;
  focusSessions: number;
  totalFocusMinutes: number;
}

export function StatsPanel({ todayCompletedTasks, focusSessions, totalFocusMinutes }: StatsPanelProps) {
  return (
    <section aria-label="统计面板">
      <h3 style={{ margin: '0.2rem 0 0.6rem' }}>统计面板</h3>
      <dl className="stats-grid">
        <div className="stat-card">
          <dt>今日完成任务数</dt>
          <dd>{todayCompletedTasks}</dd>
        </div>
        <div className="stat-card">
          <dt>专注次数</dt>
          <dd>{focusSessions}</dd>
        </div>
        <div className="stat-card">
          <dt>专注总时长</dt>
          <dd>{formatMinutesLabel(totalFocusMinutes)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default StatsPanel;
