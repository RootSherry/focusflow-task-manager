import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FocusStats } from '../../../types/focus';
import {
  DEFAULT_BREAK_MINUTES,
  DEFAULT_FOCUS_MINUTES,
  addCompletedFocusSession,
  formatSeconds,
  getPhaseDurationSeconds,
  normalizeSettings,
  normalizeStats,
} from '../focusUtils';

describe('focusUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('normalizeSettings 在无输入时返回默认 25/5', () => {
    expect(normalizeSettings()).toEqual({
      focusMinutes: DEFAULT_FOCUS_MINUTES,
      breakMinutes: DEFAULT_BREAK_MINUTES,
    });
  });

  it('normalizeSettings 会修正非法时长', () => {
    expect(normalizeSettings({ focusMinutes: -2, breakMinutes: Number.NaN })).toEqual({
      focusMinutes: 1,
      breakMinutes: DEFAULT_BREAK_MINUTES,
    });
  });

  it('getPhaseDurationSeconds 按阶段返回正确秒数', () => {
    const settings = { focusMinutes: 30, breakMinutes: 10 };
    expect(getPhaseDurationSeconds('focus', settings)).toBe(1800);
    expect(getPhaseDurationSeconds('break', settings)).toBe(600);
  });

  it('formatSeconds 正确格式化时间', () => {
    expect(formatSeconds(0)).toBe('00:00');
    expect(formatSeconds(65)).toBe('01:05');
    expect(formatSeconds(3661)).toBe('01:01:01');
  });

  it('addCompletedFocusSession 会累加次数和总时长，并写入完成时间', () => {
    const result = addCompletedFocusSession(
      {
        completedFocusSessions: 2,
        totalFocusMinutes: 50,
        lastCompletedAt: null,
      },
      25,
    );

    expect(result).toEqual({
      completedFocusSessions: 3,
      totalFocusMinutes: 75,
      lastCompletedAt: '2026-01-02T03:04:05.000Z',
    });
  });

  it('normalizeStats 对非法输入回退到安全值', () => {
    const invalidPayload = {
      completedFocusSessions: -10,
      totalFocusMinutes: 'abc',
      lastCompletedAt: 123,
    } as unknown as Partial<FocusStats>;
    const result = normalizeStats(invalidPayload);

    expect(result).toEqual({
      completedFocusSessions: 0,
      totalFocusMinutes: 0,
      lastCompletedAt: null,
    });
  });
});
