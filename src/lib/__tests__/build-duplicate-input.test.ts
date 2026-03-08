import { describe, test, expect } from 'vitest';
import { buildDuplicateInput } from '../timer-form-helpers';
import type { Timer } from '@/domain/timer/types';

describe('buildDuplicateInput', () => {
  test('should append （コピー） to the name', () => {
    // Given
    const timer: Timer = {
      id: 'timer-1',
      name: 'My Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildDuplicateInput(timer);

    // Then
    expect(result.name).toBe('My Countdown（コピー）');
    expect(result.type).toBe('countdown');
  });

  test('should copy tags from original timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-2',
      name: 'Tagged Timer',
      type: 'elapsed',
      startDate: '2025-06-01T10:00:00.000Z',
      tags: ['work', 'important'],
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildDuplicateInput(timer);

    // Then
    expect(result.tags).toEqual(['work', 'important']);
    expect(result.name).toBe('Tagged Timer（コピー）');
  });

  test('should not include tags if original has no tags', () => {
    // Given
    const timer: Timer = {
      id: 'timer-3',
      name: 'No Tags',
      type: 'countdown-elapsed',
      targetDate: '2025-12-31T23:59:59.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildDuplicateInput(timer);

    // Then
    expect(result.tags).toBeUndefined();
  });

  test('should copy stamina timer values', () => {
    // Given
    const timer: Timer = {
      id: 'timer-4',
      name: 'Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      tags: ['game'],
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildDuplicateInput(timer);

    // Then
    expect(result).toEqual({
      name: 'Stamina（コピー）',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      tags: ['game'],
    });
  });

  test('should copy periodic-increment timer values', () => {
    // Given
    const timer: Timer = {
      id: 'timer-5',
      name: 'Daily Points',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['09:00', '18:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildDuplicateInput(timer);

    // Then
    expect(result).toEqual({
      name: 'Daily Points（コピー）',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['09:00', '18:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should not mutate original tags array', () => {
    // Given
    const originalTags = ['a', 'b'];
    const timer: Timer = {
      id: 'timer-6',
      name: 'Test',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
      tags: originalTags,
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildDuplicateInput(timer);
    result.tags!.push('c');

    // Then - original should not be modified
    expect(originalTags).toEqual(['a', 'b']);
  });
});
