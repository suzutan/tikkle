import { describe, test, expect } from 'vitest';
import { computeTimerState } from '../compute';
import type {
  CountdownTimer,
  ElapsedTimer,
  CountdownElapsedTimer,
  StaminaTimer,
  PeriodicIncrementTimer,
} from '../types';

describe('computeTimerState', () => {
  const now = new Date('2025-06-15T12:00:00.000Z');

  test('should dispatch countdown timer to computeCountdown', () => {
    // Given
    const timer: CountdownTimer = {
      id: 'timer-1',
      name: 'Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const state = computeTimerState(timer, now);

    // Then
    expect(state.type).toBe('countdown');
  });

  test('should dispatch elapsed timer to computeElapsed', () => {
    // Given
    const timer: ElapsedTimer = {
      id: 'timer-2',
      name: 'Elapsed',
      type: 'elapsed',
      startDate: '2025-01-01T00:00:00.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const state = computeTimerState(timer, now);

    // Then
    expect(state.type).toBe('elapsed');
  });

  test('should dispatch countdown-elapsed timer to computeCountdownElapsed', () => {
    // Given
    const timer: CountdownElapsedTimer = {
      id: 'timer-3',
      name: 'Countdown-Elapsed',
      type: 'countdown-elapsed',
      targetDate: '2025-12-31T23:59:59.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const state = computeTimerState(timer, now);

    // Then
    expect(state.type).toBe('countdown-elapsed');
  });

  test('should dispatch stamina timer to computeStamina', () => {
    // Given
    const timer: StaminaTimer = {
      id: 'timer-4',
      name: 'Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T11:00:00.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const state = computeTimerState(timer, now);

    // Then
    expect(state.type).toBe('stamina');
  });

  test('should dispatch periodic-increment timer to computePeriodicIncrement', () => {
    // Given
    const timer: PeriodicIncrementTimer = {
      id: 'timer-5',
      name: 'Periodic',
      type: 'periodic-increment',
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T08:00:00.000Z',
      priority: 4,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const state = computeTimerState(timer, now);

    // Then
    expect(state.type).toBe('periodic-increment');
  });
});
