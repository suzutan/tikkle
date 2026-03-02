import { describe, test, expect } from 'vitest';
import { buildInitialState } from '../timer-form-helpers';
import type { Timer } from '@/domain/timer/types';

describe('buildInitialState', () => {
  test('should return countdown input when given countdown timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-1',
      name: 'My Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'My Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
    });
  });

  test('should return elapsed input when given elapsed timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-2',
      name: 'My Elapsed',
      type: 'elapsed',
      startDate: '2025-06-01T10:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'My Elapsed',
      type: 'elapsed',
      startDate: '2025-06-01T10:00:00.000Z',
    });
  });

  test('should return countdown-elapsed input when given countdown-elapsed timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-3',
      name: 'My Deadline',
      type: 'countdown-elapsed',
      targetDate: '2025-12-31T23:59:59.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'My Deadline',
      type: 'countdown-elapsed',
      targetDate: '2025-12-31T23:59:59.000Z',
    });
  });

  test('should return stamina input when given stamina timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-4',
      name: 'Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should return periodic-increment input when given periodic-increment timer', () => {
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
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'Daily Points',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['09:00', '18:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });
});
