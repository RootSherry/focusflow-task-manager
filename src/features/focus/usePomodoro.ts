import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FocusPhase, FocusStats, PomodoroSettings, TimerStatus } from '../../types/focus';
import { loadFocusSettings, loadFocusStats, saveFocusSettings, saveFocusStats } from './focusStorage';
import {
  addCompletedFocusSession,
  clampSessionMinutes,
  formatSeconds,
  getPhaseDurationSeconds,
  normalizeSettings,
} from './focusUtils';

export interface UsePomodoroOptions {
  onPhaseEnd?: (endedPhase: FocusPhase, nextPhase: FocusPhase, message: string) => void;
}

export interface UsePomodoroResult {
  phase: FocusPhase;
  status: TimerStatus;
  remainingSeconds: number;
  formattedTime: string;
  progress: number;
  settings: PomodoroSettings;
  stats: FocusStats;
  alertMessage: string | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  clearAlert: () => void;
  setFocusMinutes: (minutes: number) => void;
  setBreakMinutes: (minutes: number) => void;
}

function buildPhaseMessage(endedPhase: FocusPhase, nextPhase: FocusPhase): string {
  const endedLabel = endedPhase === 'focus' ? '专注' : '休息';
  const nextLabel = nextPhase === 'focus' ? '专注' : '休息';
  return `${endedLabel}阶段结束，进入${nextLabel}阶段。`;
}

export function usePomodoro(options: UsePomodoroOptions = {}): UsePomodoroResult {
  const initialSettingsRef = useRef<PomodoroSettings>(loadFocusSettings());
  const [settings, setSettings] = useState<PomodoroSettings>(initialSettingsRef.current);
  const [stats, setStats] = useState<FocusStats>(() => loadFocusStats());
  const [phase, setPhase] = useState<FocusPhase>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    getPhaseDurationSeconds('focus', initialSettingsRef.current),
  );

  const settingsRef = useRef(settings);
  const phaseRef = useRef(phase);
  const statusRef = useRef(status);
  const onPhaseEndRef = useRef(options.onPhaseEnd);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    onPhaseEndRef.current = options.onPhaseEnd;
  }, [options.onPhaseEnd]);

  useEffect(() => {
    saveFocusSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveFocusStats(stats);
  }, [stats]);

  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous > 1) {
          return previous - 1;
        }

        const endedPhase = phaseRef.current;
        const nextPhase: FocusPhase = endedPhase === 'focus' ? 'break' : 'focus';
        const currentSettings = settingsRef.current;

        if (endedPhase === 'focus') {
          setStats((currentStats) =>
            addCompletedFocusSession(currentStats, currentSettings.focusMinutes),
          );
        }

        const message = buildPhaseMessage(endedPhase, nextPhase);
        setAlertMessage(message);

        phaseRef.current = nextPhase;
        setPhase(nextPhase);
        onPhaseEndRef.current?.(endedPhase, nextPhase, message);

        return getPhaseDurationSeconds(nextPhase, currentSettings);
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [status]);

  const start = useCallback(() => {
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    setStatus((current) => (current === 'running' ? 'paused' : current));
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    phaseRef.current = 'focus';
    setPhase('focus');
    setRemainingSeconds(getPhaseDurationSeconds('focus', settingsRef.current));
    setAlertMessage(null);
  }, []);

  const clearAlert = useCallback(() => {
    setAlertMessage(null);
  }, []);

  const setFocusMinutes = useCallback((minutes: number) => {
    setSettings((current) => {
      const next = normalizeSettings({
        ...current,
        focusMinutes: clampSessionMinutes(minutes, current.focusMinutes),
      });

      if (statusRef.current === 'idle') {
        setRemainingSeconds(getPhaseDurationSeconds(phaseRef.current, next));
      }

      return next;
    });
  }, []);

  const setBreakMinutes = useCallback((minutes: number) => {
    setSettings((current) => {
      const next = normalizeSettings({
        ...current,
        breakMinutes: clampSessionMinutes(minutes, current.breakMinutes),
      });

      if (statusRef.current === 'idle') {
        setRemainingSeconds(getPhaseDurationSeconds(phaseRef.current, next));
      }

      return next;
    });
  }, []);

  const progress = useMemo(() => {
    const totalSeconds = getPhaseDurationSeconds(phase, settings);
    if (totalSeconds <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds));
  }, [phase, settings, remainingSeconds]);

  return {
    phase,
    status,
    remainingSeconds,
    formattedTime: formatSeconds(remainingSeconds),
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
  };
}
