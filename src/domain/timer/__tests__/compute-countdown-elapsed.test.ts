import { describe, test, expect } from 'vitest';
import { computeCountdownElapsed } from '../compute-countdown-elapsed';
import type { CountdownElapsedTimer } from '../types';

function createCountdownElapsedTimer(overrides: {
  targetDate: string;
}): CountdownElapsedTimer {
  return {
    id: 'timer-1',
    name: 'Test Countdown-Elapsed',
    type: 'countdown-elapsed',
    targetDate: overrides.targetDate,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

describe('computeCountdownElapsed', () => {
  test('should return countdown mode when target date is in the future', () => {
    // Given
    const targetDate = '2025-12-31T23:59:59.000Z';
    const timer = createCountdownElapsedTimer({ targetDate });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeCountdownElapsed(timer, now);

    // Then
    const expectedMs =
      new Date(targetDate).getTime() - now.getTime();
    expect(state.type).toBe('countdown-elapsed');
    expect(state.mode).toBe('countdown');
    expect(state.ms).toBe(expectedMs);
  });

  test('should return elapsed mode when target date is in the past', () => {
    // Given
    const targetDate = '2025-01-01T00:00:00.000Z';
    const timer = createCountdownElapsedTimer({ targetDate });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeCountdownElapsed(timer, now);

    // Then
    const expectedMs =
      now.getTime() - new Date(targetDate).getTime();
    expect(state.mode).toBe('elapsed');
    expect(state.ms).toBe(expectedMs);
  });

  test('should return elapsed mode with 0ms when target date equals now', () => {
    // Given
    const targetDate = '2025-06-15T12:00:00.000Z';
    const timer = createCountdownElapsedTimer({ targetDate });
    const now = new Date(targetDate);

    // When
    const state = computeCountdownElapsed(timer, now);

    // Then
    expect(state.mode).toBe('elapsed');
    expect(state.ms).toBe(0);
  });

  test('should return countdown with 1ms when target is 1ms in the future', () => {
    // Given
    const timer = createCountdownElapsedTimer({
      targetDate: '2025-06-15T12:00:00.001Z',
    });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeCountdownElapsed(timer, now);

    // Then
    expect(state.mode).toBe('countdown');
    expect(state.ms).toBe(1);
  });

  test('should return elapsed with 1ms when target is 1ms in the past', () => {
    // Given
    const timer = createCountdownElapsedTimer({
      targetDate: '2025-06-15T11:59:59.999Z',
    });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeCountdownElapsed(timer, now);

    // Then
    expect(state.mode).toBe('elapsed');
    expect(state.ms).toBe(1);
  });
});
