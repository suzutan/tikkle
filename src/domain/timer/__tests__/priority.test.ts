import { describe, test, expect } from 'vitest';
import { isPriorityLevel, PRIORITY_LABELS } from '../priority';
import type { PriorityLevel } from '../priority';

describe('isPriorityLevel', () => {
  test('有効な値 1-4 を受け入れる', () => {
    // Given/When/Then
    expect(isPriorityLevel(1)).toBe(true);
    expect(isPriorityLevel(2)).toBe(true);
    expect(isPriorityLevel(3)).toBe(true);
    expect(isPriorityLevel(4)).toBe(true);
  });

  test('0 を拒否する', () => {
    // Given/When/Then
    expect(isPriorityLevel(0)).toBe(false);
  });

  test('5 を拒否する', () => {
    // Given/When/Then
    expect(isPriorityLevel(5)).toBe(false);
  });

  test('小数を拒否する', () => {
    // Given/When/Then
    expect(isPriorityLevel(1.5)).toBe(false);
  });

  test('負の数を拒否する', () => {
    // Given/When/Then
    expect(isPriorityLevel(-1)).toBe(false);
  });
});

describe('PRIORITY_LABELS', () => {
  test('全レベルのラベルが定義されている', () => {
    // Given
    const levels: PriorityLevel[] = [1, 2, 3, 4];

    // When/Then
    expect(PRIORITY_LABELS[1]).toBe('緊急');
    expect(PRIORITY_LABELS[2]).toBe('高');
    expect(PRIORITY_LABELS[3]).toBe('中');
    expect(PRIORITY_LABELS[4]).toBe('なし');
    expect(Object.keys(PRIORITY_LABELS)).toHaveLength(levels.length);
  });
});
