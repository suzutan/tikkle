import { describe, test, expect } from 'vitest';
import { compareTimers, isValidSortMode } from '../sort';
import type { SortMode } from '../sort';
import type { Timer } from '../types';

function createTimer(overrides: Partial<Timer> & { id: string }): Timer {
  return {
    name: 'Test',
    type: 'countdown',
    targetDate: '2026-12-31T00:00:00.000Z',
    priority: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Timer;
}

describe('isValidSortMode', () => {
  test('有効なソートモードを受け入れる', () => {
    // Given/When/Then
    expect(isValidSortMode('priority')).toBe(true);
    expect(isValidSortMode('urgency')).toBe(true);
    expect(isValidSortMode('created-asc')).toBe(true);
    expect(isValidSortMode('created-desc')).toBe(true);
    expect(isValidSortMode('manual')).toBe(true);
  });

  test('無効なソートモードを拒否する', () => {
    // Given/When/Then
    expect(isValidSortMode('invalid')).toBe(false);
    expect(isValidSortMode('')).toBe(false);
  });
});

describe('compareTimers', () => {
  const now = new Date('2026-06-15T00:00:00.000Z');

  describe('priority モード', () => {
    test('優先度の高い方が先に来る', () => {
      // Given
      const a = createTimer({ id: 'a', priority: 1 });
      const b = createTimer({ id: 'b', priority: 3 });

      // When
      const result = compareTimers(a, b, 'priority', now);

      // Then
      expect(result).toBeLessThan(0);
    });

    test('同じ優先度の場合、新しいものが先', () => {
      // Given
      const a = createTimer({ id: 'a', priority: 2, createdAt: '2026-01-01T00:00:00.000Z' });
      const b = createTimer({ id: 'b', priority: 2, createdAt: '2026-06-01T00:00:00.000Z' });

      // When
      const result = compareTimers(a, b, 'priority', now);

      // Then - b は新しいので先に来る
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('urgency モード', () => {
    test('期限超過のタイマーが通常より先に来る', () => {
      // Given - 期限切れ countdown
      const overdue = createTimer({
        id: 'a',
        type: 'countdown',
        targetDate: '2026-01-01T00:00:00.000Z', // 過去
      });
      // 期限が遠い countdown
      const normal = createTimer({
        id: 'b',
        type: 'countdown',
        targetDate: '2027-12-31T00:00:00.000Z', // 遠い未来
      });

      // When
      const result = compareTimers(overdue, normal, 'urgency', now);

      // Then
      expect(result).toBeLessThan(0);
    });
  });

  describe('created-asc モード', () => {
    test('古いものが先に来る', () => {
      // Given
      const older = createTimer({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' });
      const newer = createTimer({ id: 'b', createdAt: '2026-06-01T00:00:00.000Z' });

      // When
      const result = compareTimers(older, newer, 'created-asc', now);

      // Then
      expect(result).toBeLessThan(0);
    });
  });

  describe('created-desc モード', () => {
    test('新しいものが先に来る', () => {
      // Given
      const older = createTimer({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' });
      const newer = createTimer({ id: 'b', createdAt: '2026-06-01T00:00:00.000Z' });

      // When
      const result = compareTimers(older, newer, 'created-desc', now);

      // Then
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('manual モード', () => {
    test('rank の小さい方が先に来る', () => {
      // Given
      const a = createTimer({ id: 'a', rank: 1.0 });
      const b = createTimer({ id: 'b', rank: 3.0 });

      // When
      const result = compareTimers(a, b, 'manual', now);

      // Then
      expect(result).toBeLessThan(0);
    });

    test('rank が未設定のタイマーは末尾に来る', () => {
      // Given
      const a = createTimer({ id: 'a', rank: 2.0 });
      const b = createTimer({ id: 'b' }); // rank undefined → Infinity

      // When
      const result = compareTimers(a, b, 'manual', now);

      // Then
      expect(result).toBeLessThan(0);
    });

    test('両方 rank 未設定の場合はタイブレークで決まる', () => {
      // Given
      const a = createTimer({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' });
      const b = createTimer({ id: 'b', createdAt: '2026-06-01T00:00:00.000Z' });

      // When
      const result = compareTimers(a, b, 'manual', now);

      // Then - b が新しいので先
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('タイブレーク', () => {
    test('同じ priority の場合、createdAt DESC でソートする', () => {
      // Given
      const a = createTimer({ id: 'a', priority: 2, createdAt: '2026-01-01T00:00:00.000Z' });
      const b = createTimer({ id: 'b', priority: 2, createdAt: '2026-06-01T00:00:00.000Z' });

      // When
      const result = compareTimers(a, b, 'priority', now);

      // Then - b の方が新しいので先
      expect(result).toBeGreaterThan(0);
    });

    test('同じ priority と createdAt の場合、id ASC でソートする', () => {
      // Given
      const a = createTimer({ id: 'alpha', priority: 2, createdAt: '2026-01-01T00:00:00.000Z' });
      const b = createTimer({ id: 'beta', priority: 2, createdAt: '2026-01-01T00:00:00.000Z' });

      // When
      const result = compareTimers(a, b, 'priority', now);

      // Then - alpha < beta なので a が先
      expect(result).toBeLessThan(0);
    });
  });
});
