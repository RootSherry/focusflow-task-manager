export type FocusPhase = 'focus' | 'break';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface PomodoroSettings {
  focusMinutes: number;
  breakMinutes: number;
}

export interface FocusStats {
  completedFocusSessions: number;
  totalFocusMinutes: number;
  lastCompletedAt: string | null;
}
