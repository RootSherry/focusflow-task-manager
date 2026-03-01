import type { FocusPhase, FocusStats, PomodoroSettings } from '../../types/focus';

export const DEFAULT_FOCUS_MINUTES = 25;
export const DEFAULT_BREAK_MINUTES = 5;
export const MIN_SESSION_MINUTES = 1;
export const MAX_SESSION_MINUTES = 180;

export function clampSessionMinutes(value: number, fallback: number): number {
  const candidate = Number.isFinite(value) ? Math.round(value) : fallback;
  if (!Number.isFinite(candidate)) {
    return fallback;
  }

  return Math.min(MAX_SESSION_MINUTES, Math.max(MIN_SESSION_MINUTES, candidate));
}

export function normalizeSettings(input?: Partial<PomodoroSettings> | null): PomodoroSettings {
  return {
    focusMinutes: clampSessionMinutes(
      input?.focusMinutes ?? DEFAULT_FOCUS_MINUTES,
      DEFAULT_FOCUS_MINUTES,
    ),
    breakMinutes: clampSessionMinutes(
      input?.breakMinutes ?? DEFAULT_BREAK_MINUTES,
      DEFAULT_BREAK_MINUTES,
    ),
  };
}

export function createDefaultStats(): FocusStats {
  return {
    completedFocusSessions: 0,
    totalFocusMinutes: 0,
    lastCompletedAt: null,
  };
}

export function normalizeStats(input?: Partial<FocusStats> | null): FocusStats {
  if (!input) {
    return createDefaultStats();
  }

  const completedFocusSessions =
    typeof input.completedFocusSessions === 'number' &&
    Number.isFinite(input.completedFocusSessions)
      ? Math.max(0, Math.floor(input.completedFocusSessions))
      : 0;

  const totalFocusMinutes =
    typeof input.totalFocusMinutes === 'number' && Number.isFinite(input.totalFocusMinutes)
      ? Math.max(0, Math.floor(input.totalFocusMinutes))
      : 0;

  return {
    completedFocusSessions,
    totalFocusMinutes,
    lastCompletedAt: typeof input.lastCompletedAt === 'string' ? input.lastCompletedAt : null,
  };
}

export function getPhaseDurationSeconds(phase: FocusPhase, settings: PomodoroSettings): number {
  const safeSettings = normalizeSettings(settings);
  const minutes = phase === 'focus' ? safeSettings.focusMinutes : safeSettings.breakMinutes;
  return minutes * 60;
}

export function formatSeconds(inputSeconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(inputSeconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      seconds,
    ).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function addCompletedFocusSession(stats: FocusStats, focusMinutes: number): FocusStats {
  const safeStats = normalizeStats(stats);
  const safeMinutes = Math.max(0, Math.floor(focusMinutes));

  return {
    completedFocusSessions: safeStats.completedFocusSessions + 1,
    totalFocusMinutes: safeStats.totalFocusMinutes + safeMinutes,
    lastCompletedAt: new Date().toISOString(),
  };
}

export function formatMinutesLabel(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return `${minutes} 分钟`;
  }

  if (minutes === 0) {
    return `${hours} 小时`;
  }

  return `${hours} 小时 ${minutes} 分钟`;
}
