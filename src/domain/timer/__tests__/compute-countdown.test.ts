import { describe, test, expect } from 'vitest';
import { computeCountdown } from '../compute-countdown';
import type { CountdownTimer } from '../types';

function createCountdownTimer(overrides: {
  targetDate: string;
}): CountdownTimer {
  return {
    id: 'timer-1',
    name: 'Test Countdown',
    type: 'countdown',
    targetDate: overrides.targetDate,
    priority: 4,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

describe('computeCountdown', () => {
  test('should return remaining time when target date is in the future', () => {
    // Given
    const targetDate = '2025-12-31T23:59:59.000Z';
    const timer = createCountdownTimer({ targetDate });
    const now = new Date('2025-12-31T00:00:00.000Z');

    // When
    const state = computeCountdown(timer, now);

    // Then
    const expectedMs =
      new Date(targetDate).getTime() - now.getTime();
    expect(state.type).toBe('countdown');
    expect(state.remainingMs).toBe(expectedMs);
    expect(state.isExpired).toBe(false);
  });

  test('should return expired when target date is in the past', () => {
    // Given
    const timer = createCountdownTimer({
      targetDate: '2025-01-01T00:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeCountdown(timer, now);

    // Then
    expect(state.type).toBe('countdown');
    expect(state.remainingMs).toBe(0);
    expect(state.isExpired).toBe(true);
  });

  test('should return expired when target date equals now', () => {
    // Given
    const targetDate = '2025-06-15T12:00:00.000Z';
    const timer = createCountdownTimer({ targetDate });
    const now = new Date(targetDate);

    // When
    const state = computeCountdown(timer, now);

    // Then
    expect(state.remainingMs).toBe(0);
    expect(state.isExpired).toBe(true);
  });

  test('should return 1ms remaining when target is 1ms in the future', () => {
    // Given
    const timer = createCountdownTimer({
      targetDate: '2025-06-15T12:00:00.001Z',
    });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeCountdown(timer, now);

    // Then
    expect(state.remainingMs).toBe(1);
    expect(state.isExpired).toBe(false);
  });

  test('should handle large remaining durations', () => {
    // Given
    const timer = createCountdownTimer({
      targetDate: '2030-01-01T00:00:00.000Z',
    });
    const now = new Date('2025-01-01T00:00:00.000Z');

    // When
    const state = computeCountdown(timer, now);

    // Then
    const expectedMs =
      new Date('2030-01-01T00:00:00.000Z').getTime() - now.getTime();
    expect(state.remainingMs).toBe(expectedMs);
    expect(state.isExpired).toBe(false);
  });
});
