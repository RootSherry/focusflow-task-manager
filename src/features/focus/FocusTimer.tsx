import { useCallback } from 'react';
import { StatsPanel } from '../stats/StatsPanel';
import { MAX_SESSION_MINUTES, MIN_SESSION_MINUTES } from './focusUtils';
import { usePomodoro } from './usePomodoro';

interface FocusTimerProps {
  todayCompletedTasks: number;
}

function parseMinutes(raw: string): number | null {
  if (raw.trim() === '') {
    return null;
  }
  const nextValue = Number(raw);
  if (!Number.isFinite(nextValue)) {
    return null;
  }
  return nextValue;
}

export function FocusTimer({ todayCompletedTasks }: FocusTimerProps) {
  const handlePhaseEnd = useCallback((_: 'focus' | 'break', __: 'focus' | 'break', message: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusFlow 番茄钟', { body: message });
    }
  }, []);

  const {
    phase,
    status,
    formattedTime,
    progress,
    settings,
    stats,
    alertMessage,
    start,
    pause,
    reset,
    clearAlert,
    setFocusMinutes,
    setBreakMinutes,
  } = usePomodoro({ onPhaseEnd: handlePhaseEnd });

  const handleFocusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseMinutes(event.target.value);
    if (nextValue === null) {
      return;
    }
    setFocusMinutes(nextValue);
  };

  const handleBreakChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseMinutes(event.target.value);
    if (nextValue === null) {
      return;
    }
    setBreakMinutes(nextValue);
  };

  const phaseLabel = phase === 'focus' ? '专注阶段' : '休息阶段';
  const actionLabel = status === 'running' ? '暂停' : status === 'paused' ? '继续' : '开始';
  const actionHandler = status === 'running' ? pause : start;

  return (
    <div className="focus-timer">
      <div>
        <h2 style={{ margin: 0 }}>专注计时</h2>
        <p style={{ margin: '0.2rem 0 0', color: '#475569' }}>{phaseLabel}</p>
      </div>

      {alertMessage ? (
        <div className="alert" role="status">
          <span>{alertMessage}</span>
          <button type="button" onClick={clearAlert} className="ghost-btn" style={{ marginLeft: 8 }}>
            关闭
          </button>
        </div>
      ) : null}

      <div className="timer-clock">{formattedTime}</div>

      <div className="timer-progress" aria-hidden>
        <div
          className={`timer-progress-bar ${phase === 'break' ? 'break-bar' : ''}`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="timer-settings">
        <label>
          <span>专注时长(分钟)</span>
          <input
            type="number"
            min={MIN_SESSION_MINUTES}
            max={MAX_SESSION_MINUTES}
            value={settings.focusMinutes}
            onChange={handleFocusChange}
          />
        </label>

        <label>
          <span>休息时长(分钟)</span>
          <input
            type="number"
            min={MIN_SESSION_MINUTES}
            max={MAX_SESSION_MINUTES}
            value={settings.breakMinutes}
            onChange={handleBreakChange}
          />
        </label>
      </div>

      <div className="timer-actions">
        <button type="button" onClick={actionHandler}>
          {actionLabel}
        </button>
        <button type="button" className="secondary" onClick={reset}>
          重置
        </button>
      </div>

      <StatsPanel
        todayCompletedTasks={todayCompletedTasks}
        focusSessions={stats.completedFocusSessions}
        totalFocusMinutes={stats.totalFocusMinutes}
      />
    </div>
  );
}

export default FocusTimer;
