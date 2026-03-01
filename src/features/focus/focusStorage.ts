import { getBrowserStorage, safeReadJSON, safeWriteJSON, type StorageLike } from '../../shared/storage';
import type { FocusStats, PomodoroSettings } from '../../types/focus';
import { normalizeSettings, normalizeStats } from './focusUtils';

const SETTINGS_KEY = 'focusflow.pomodoro.settings.v1';
const STATS_KEY = 'focusflow.pomodoro.stats.v1';

export function loadFocusSettings(storage: StorageLike | null = getBrowserStorage()): PomodoroSettings {
  const cached = safeReadJSON<Partial<PomodoroSettings>>(storage, SETTINGS_KEY);
  return normalizeSettings(cached);
}

export function saveFocusSettings(
  settings: PomodoroSettings,
  storage: StorageLike | null = getBrowserStorage(),
): boolean {
  return safeWriteJSON(storage, SETTINGS_KEY, normalizeSettings(settings));
}

export function loadFocusStats(storage: StorageLike | null = getBrowserStorage()): FocusStats {
  const cached = safeReadJSON<Partial<FocusStats>>(storage, STATS_KEY);
  return normalizeStats(cached);
}

export function saveFocusStats(
  stats: FocusStats,
  storage: StorageLike | null = getBrowserStorage(),
): boolean {
  return safeWriteJSON(storage, STATS_KEY, normalizeStats(stats));
}
