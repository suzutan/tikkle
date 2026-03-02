import { describe, test, expect } from 'vitest';
import { computeElapsed } from '../compute-elapsed';
import type { ElapsedTimer } from '../types';

function createElapsedTimer(overrides: {
  startDate: string;
}): ElapsedTimer {
  return {
    id: 'timer-1',
    name: 'Test Elapsed',
    type: 'elapsed',
    startDate: overrides.startDate,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

describe('computeElapsed', () => {
  test('should return elapsed time when start date is in the past', () => {
    // Given
    const startDate = '2025-01-01T00:00:00.000Z';
    const timer = createElapsedTimer({ startDate });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeElapsed(timer, now);

    // Then
    const expectedMs = now.getTime() - new Date(startDate).getTime();
    expect(state.type).toBe('elapsed');
    expect(state.elapsedMs).toBe(expectedMs);
  });

  test('should return 0 elapsed when start date equals now', () => {
    // Given
    const startDate = '2025-06-15T12:00:00.000Z';
    const timer = createElapsedTimer({ startDate });
    const now = new Date(startDate);

    // When
    const state = computeElapsed(timer, now);

    // Then
    expect(state.elapsedMs).toBe(0);
  });

  test('should clamp to 0 when start date is in the future', () => {
    // Given
    const timer = createElapsedTimer({
      startDate: '2025-12-31T23:59:59.000Z',
    });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeElapsed(timer, now);

    // Then
    expect(state.elapsedMs).toBe(0);
  });

  test('should return 1ms elapsed when 1ms has passed', () => {
    // Given
    const timer = createElapsedTimer({
      startDate: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:00:00.001Z');

    // When
    const state = computeElapsed(timer, now);

    // Then
    expect(state.elapsedMs).toBe(1);
  });

  test('should handle large elapsed durations', () => {
    // Given
    const timer = createElapsedTimer({
      startDate: '2020-01-01T00:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:00:00.000Z');

    // When
    const state = computeElapsed(timer, now);

    // Then
    const expectedMs =
      now.getTime() - new Date('2020-01-01T00:00:00.000Z').getTime();
    expect(state.elapsedMs).toBe(expectedMs);
  });
});
