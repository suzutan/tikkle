import { describe, test, expect } from 'vitest';
import { getUrgencyLevel, compareByUrgency } from '../urgency';
import type { Timer } from '../types';

const NOW = new Date('2026-06-15T12:00:00.000Z');

function makeCountdown(targetDate: string): Timer {
  return {
    id: 'test',
    name: 'Test',
    type: 'countdown',
    targetDate,
    priority: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeStamina(currentValue: number, maxValue: number): Timer {
  return {
    id: 'test',
    name: 'Test',
    type: 'stamina',
    currentValue,
    maxValue,
    recoveryIntervalMinutes: 5,
    lastUpdatedAt: '2026-06-15T12:00:00.000Z',
    priority: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('getUrgencyLevel', () => {
  test('期限超過の countdown は overdue', () => {
    // Given: 期限が過去の countdown タイマー
    const timer = makeCountdown('2026-06-14T00:00:00.000Z');

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: overdue が返される
    expect(level).toBe('overdue');
  });

  test('今日期限の countdown は today', () => {
    // Given: 今日中が期限の countdown タイマー
    const timer = makeCountdown('2026-06-15T18:00:00.000Z');

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: today が返される
    expect(level).toBe('today');
  });

  test('3日以内が期限の countdown は soon', () => {
    // Given: 2日後が期限の countdown タイマー
    const timer = makeCountdown('2026-06-17T00:00:00.000Z');

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: soon が返される
    expect(level).toBe('soon');
  });

  test('4日以上先の countdown は normal', () => {
    // Given: 1週間後が期限の countdown タイマー
    const timer = makeCountdown('2026-06-22T00:00:00.000Z');

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: normal が返される
    expect(level).toBe('normal');
  });

  test('countdown-elapsed も同様に判定される', () => {
    // Given: 期限超過の countdown-elapsed タイマー
    const timer: Timer = {
      id: 'test',
      name: 'Test',
      type: 'countdown-elapsed',
      targetDate: '2026-06-14T00:00:00.000Z',
      priority: 4,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: overdue が返される
    expect(level).toBe('overdue');
  });

  test('elapsed タイマーは常に normal', () => {
    // Given: elapsed タイマー
    const timer: Timer = {
      id: 'test',
      name: 'Test',
      type: 'elapsed',
      startDate: '2026-01-01T00:00:00.000Z',
      priority: 4,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: normal が返される
    expect(level).toBe('normal');
  });

  test('スタミナ 0 は overdue', () => {
    // Given: スタミナが 0 のタイマー
    const timer = makeStamina(0, 100);

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: overdue が返される
    expect(level).toBe('overdue');
  });

  test('スタミナ 20% 以下は today', () => {
    // Given: スタミナが 15% のタイマー
    const timer = makeStamina(15, 100);

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: today が返される
    expect(level).toBe('today');
  });

  test('スタミナ 50% 以下は soon', () => {
    // Given: スタミナが 40% のタイマー
    const timer = makeStamina(40, 100);

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: soon が返される
    expect(level).toBe('soon');
  });

  test('スタミナ満タンは normal', () => {
    // Given: スタミナが満タンのタイマー
    const timer = makeStamina(100, 100);

    // When: 緊急度を判定する
    const level = getUrgencyLevel(timer, NOW);

    // Then: normal が返される
    expect(level).toBe('normal');
  });
});

describe('compareByUrgency', () => {
  test('overdue が normal より先にソートされる', () => {
    // Given: overdue と normal のタイマー
    const overdue = makeCountdown('2026-06-14T00:00:00.000Z');
    const normal = makeCountdown('2026-06-22T00:00:00.000Z');

    // When: 比較する
    const result = compareByUrgency(overdue, normal, NOW);

    // Then: overdue が先
    expect(result).toBeLessThan(0);
  });

  test('today が soon より先にソートされる', () => {
    // Given: today と soon のタイマー
    const today = makeCountdown('2026-06-15T18:00:00.000Z');
    const soon = makeCountdown('2026-06-17T00:00:00.000Z');

    // When: 比較する
    const result = compareByUrgency(today, soon, NOW);

    // Then: today が先
    expect(result).toBeLessThan(0);
  });

  test('同じ緊急度なら 0 が返される', () => {
    // Given: 同じ urgency level のタイマー
    const a = makeCountdown('2026-06-22T00:00:00.000Z');
    const b = makeCountdown('2026-06-25T00:00:00.000Z');

    // When: 比較する
    const result = compareByUrgency(a, b, NOW);

    // Then: 0
    expect(result).toBe(0);
  });
});
