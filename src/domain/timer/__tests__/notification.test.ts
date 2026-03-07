import { describe, test, expect } from 'vitest';
import { checkNotification } from '../notification';
import type { Timer, TimerState } from '../types';

describe('checkNotification', () => {
  test('countdown が期限切れになったら通知する', () => {
    // Given: countdown タイマーと状態遷移
    const timer: Timer = {
      id: 't1', name: 'My Timer', type: 'countdown',
      targetDate: '2026-06-15T12:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const prev: TimerState = { type: 'countdown', remainingMs: 1000, isExpired: false };
    const curr: TimerState = { type: 'countdown', remainingMs: 0, isExpired: true };

    // When: 通知チェック
    const result = checkNotification(timer, curr, prev);

    // Then: 通知される
    expect(result.shouldNotify).toBe(true);
    expect(result.title).toContain('My Timer');
    expect(result.title).toContain('期限到達');
  });

  test('countdown が既に期限切れなら通知しない', () => {
    // Given: 既に expired だった状態
    const timer: Timer = {
      id: 't1', name: 'My Timer', type: 'countdown',
      targetDate: '2026-06-15T12:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const prev: TimerState = { type: 'countdown', remainingMs: 0, isExpired: true };
    const curr: TimerState = { type: 'countdown', remainingMs: 0, isExpired: true };

    // When: 通知チェック
    const result = checkNotification(timer, curr, prev);

    // Then: 通知されない
    expect(result.shouldNotify).toBe(false);
  });

  test('countdown-elapsed がモード切替したら通知する', () => {
    // Given: countdown→elapsed モード切替
    const timer: Timer = {
      id: 't2', name: 'Deadline', type: 'countdown-elapsed',
      targetDate: '2026-06-15T12:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const prev: TimerState = { type: 'countdown-elapsed', mode: 'countdown', ms: 1000 };
    const curr: TimerState = { type: 'countdown-elapsed', mode: 'elapsed', ms: 100 };

    // When: 通知チェック
    const result = checkNotification(timer, curr, prev);

    // Then: 通知される
    expect(result.shouldNotify).toBe(true);
    expect(result.title).toContain('Deadline');
  });

  test('stamina が満タンになったら通知する', () => {
    // Given: スタミナが未満タンから満タンへ
    const timer: Timer = {
      id: 't3', name: 'Stamina', type: 'stamina',
      currentValue: 100, maxValue: 100, recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2026-06-15T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const prev: TimerState = {
      type: 'stamina', currentValue: 99, maxValue: 100,
      isFull: false, nextRecoveryMs: 1000, timeToFullMs: 1000,
    };
    const curr: TimerState = {
      type: 'stamina', currentValue: 100, maxValue: 100,
      isFull: true, nextRecoveryMs: 0, timeToFullMs: 0,
    };

    // When: 通知チェック
    const result = checkNotification(timer, curr, prev);

    // Then: 通知される
    expect(result.shouldNotify).toBe(true);
    expect(result.body).toContain('100');
  });

  test('periodic-increment が上限到達したら通知する', () => {
    // Given: periodic-increment が上限未到達→到達
    const timer: Timer = {
      id: 't4', name: 'Points', type: 'periodic-increment',
      currentValue: 100, maxValue: 100, incrementAmount: 10,
      scheduleTimes: ['06:00'], lastUpdatedAt: '2026-06-15T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const prev: TimerState = {
      type: 'periodic-increment', currentValue: 90, maxValue: 100,
      isAtMax: false, nextIncrementAt: new Date(), timeToMaxMs: 1000,
    };
    const curr: TimerState = {
      type: 'periodic-increment', currentValue: 100, maxValue: 100,
      isAtMax: true, nextIncrementAt: null, timeToMaxMs: 0,
    };

    // When: 通知チェック
    const result = checkNotification(timer, curr, prev);

    // Then: 通知される
    expect(result.shouldNotify).toBe(true);
    expect(result.title).toContain('Points');
  });

  test('elapsed タイマーは通知しない', () => {
    // Given: elapsed タイマー
    const timer: Timer = {
      id: 't5', name: 'Elapsed', type: 'elapsed',
      startDate: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const prev: TimerState = { type: 'elapsed', elapsedMs: 1000 };
    const curr: TimerState = { type: 'elapsed', elapsedMs: 2000 };

    // When: 通知チェック
    const result = checkNotification(timer, curr, prev);

    // Then: 通知されない
    expect(result.shouldNotify).toBe(false);
  });

  test('prevState が null なら通知しない', () => {
    // Given: 初回状態（prevState なし）
    const timer: Timer = {
      id: 't1', name: 'My Timer', type: 'countdown',
      targetDate: '2026-06-15T12:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const curr: TimerState = { type: 'countdown', remainingMs: 0, isExpired: true };

    // When: 通知チェック
    const result = checkNotification(timer, curr, null);

    // Then: 通知されない
    expect(result.shouldNotify).toBe(false);
  });
});
