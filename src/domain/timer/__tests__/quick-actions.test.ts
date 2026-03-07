import { describe, test, expect } from 'vitest';
import { applyQuickAction } from '../quick-actions';
import type { Timer } from '../types';

const NOW = new Date('2026-06-15T12:00:00.000Z');

function makeStamina(currentValue: number, maxValue: number): Timer {
  return {
    id: 'test',
    name: 'Test Stamina',
    type: 'stamina',
    currentValue,
    maxValue,
    recoveryIntervalMinutes: 5,
    lastUpdatedAt: '2026-06-15T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makePeriodicIncrement(currentValue: number, maxValue: number): Timer {
  return {
    id: 'test',
    name: 'Test Periodic',
    type: 'periodic-increment',
    currentValue,
    maxValue,
    incrementAmount: 10,
    scheduleTimes: ['06:00', '12:00'],
    lastUpdatedAt: '2026-06-15T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('applyQuickAction', () => {
  describe('adjust-value', () => {
    test('スタミナの値を増加できる', () => {
      // Given: currentValue=50, maxValue=100 のスタミナタイマー
      const timer = makeStamina(50, 100);

      // When: +10 する
      const result = applyQuickAction(timer, { action: 'adjust-value', delta: 10 }, NOW);

      // Then: currentValue が 60 になる
      expect(result.currentValue).toBe(60);
      expect(result.lastUpdatedAt).toBe(NOW.toISOString());
    });

    test('スタミナの値を減少できる', () => {
      // Given: currentValue=50, maxValue=100 のスタミナタイマー
      const timer = makeStamina(50, 100);

      // When: -20 する
      const result = applyQuickAction(timer, { action: 'adjust-value', delta: -20 }, NOW);

      // Then: currentValue が 30 になる
      expect(result.currentValue).toBe(30);
    });

    test('最大値を超えない', () => {
      // Given: currentValue=90, maxValue=100 のスタミナタイマー
      const timer = makeStamina(90, 100);

      // When: +20 する
      const result = applyQuickAction(timer, { action: 'adjust-value', delta: 20 }, NOW);

      // Then: currentValue が maxValue (100) になる
      expect(result.currentValue).toBe(100);
    });

    test('0未満にならない', () => {
      // Given: currentValue=10, maxValue=100 のスタミナタイマー
      const timer = makeStamina(10, 100);

      // When: -50 する
      const result = applyQuickAction(timer, { action: 'adjust-value', delta: -50 }, NOW);

      // Then: currentValue が 0 になる
      expect(result.currentValue).toBe(0);
    });

    test('periodic-increment でも動作する', () => {
      // Given: currentValue=30, maxValue=100 の periodic-increment タイマー
      const timer = makePeriodicIncrement(30, 100);

      // When: +10 する
      const result = applyQuickAction(timer, { action: 'adjust-value', delta: 10 }, NOW);

      // Then: currentValue が 40 になる
      expect(result.currentValue).toBe(40);
    });
  });

  describe('reset-value', () => {
    test('値を0にリセットできる', () => {
      // Given: currentValue=80 のスタミナタイマー
      const timer = makeStamina(80, 100);

      // When: reset する
      const result = applyQuickAction(timer, { action: 'reset-value' }, NOW);

      // Then: currentValue が 0 になる
      expect(result.currentValue).toBe(0);
      expect(result.lastUpdatedAt).toBe(NOW.toISOString());
    });
  });

  describe('max-value', () => {
    test('値を最大にできる', () => {
      // Given: currentValue=30 のスタミナタイマー
      const timer = makeStamina(30, 100);

      // When: max にする
      const result = applyQuickAction(timer, { action: 'max-value' }, NOW);

      // Then: currentValue が maxValue (100) になる
      expect(result.currentValue).toBe(100);
      expect(result.lastUpdatedAt).toBe(NOW.toISOString());
    });
  });

  test('サポートされていないタイマータイプではエラー', () => {
    // Given: countdown タイマー
    const timer: Timer = {
      id: 'test',
      name: 'Test',
      type: 'countdown',
      targetDate: '2026-12-31T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    // When/Then: エラーが投げられる
    expect(() =>
      applyQuickAction(timer, { action: 'adjust-value', delta: 10 }, NOW),
    ).toThrow('Quick actions are only supported for stamina and periodic-increment timers');
  });
});
