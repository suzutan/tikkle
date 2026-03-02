import { describe, test, expect } from 'vitest';
import { computePeriodicIncrement } from '../compute-periodic-increment';
import type { PeriodicIncrementTimer } from '../types';

function createPeriodicTimer(overrides: {
  currentValue: number;
  maxValue: number;
  incrementAmount: number;
  scheduleTimes: string[];
  lastUpdatedAt: string;
}): PeriodicIncrementTimer {
  return {
    id: 'timer-1',
    name: 'Test Periodic',
    type: 'periodic-increment',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computePeriodicIncrement', () => {
  test('should calculate increments from scheduled events', () => {
    // Given: schedule at 09:00 and 21:00, +3 each, last updated before 09:00
    const timer = createPeriodicTimer({
      currentValue: 90,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T08:00:00.000',
    });
    // now is after 09:00 → 1 event occurred → +3
    const now = new Date('2025-06-15T10:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.type).toBe('periodic-increment');
    expect(state.currentValue).toBe(93); // 90 + 3
    expect(state.maxValue).toBe(100);
    expect(state.isAtMax).toBe(false);
  });

  test('should cap at max value', () => {
    // Given: increment would exceed max
    const timer = createPeriodicTimer({
      currentValue: 99,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T08:00:00.000',
    });
    const now = new Date('2025-06-15T10:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.currentValue).toBe(100);
    expect(state.isAtMax).toBe(true);
    expect(state.timeToMaxMs).toBe(0);
  });

  test('should return at-max state when already at max', () => {
    // Given
    const timer = createPeriodicTimer({
      currentValue: 100,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T08:00:00.000',
    });
    const now = new Date('2025-06-15T10:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.currentValue).toBe(100);
    expect(state.isAtMax).toBe(true);
    expect(state.timeToMaxMs).toBe(0);
  });

  test('should handle no events in period', () => {
    // Given: last updated after 09:00, now before 21:00 → no events
    const timer = createPeriodicTimer({
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T10:00:00.000',
    });
    const now = new Date('2025-06-15T15:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.currentValue).toBe(50);
    expect(state.isAtMax).toBe(false);
  });

  test('should handle multiple days of events', () => {
    // Given: schedule at 09:00 and 21:00, +3 each
    // From June 13 10:00 to June 15 10:00 = 2 full days
    // Events: Jun 13 21:00, Jun 14 09:00, Jun 14 21:00, Jun 15 09:00 = 4 events
    const timer = createPeriodicTimer({
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-13T10:00:00.000',
    });
    const now = new Date('2025-06-15T10:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.currentValue).toBe(62); // 50 + 4*3
  });

  test('should calculate nextIncrementAt for next scheduled time today', () => {
    // Given: schedule at 09:00 and 21:00, now is 15:00
    const timer = createPeriodicTimer({
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T10:00:00.000',
    });
    const now = new Date('2025-06-15T15:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.nextIncrementAt).not.toBeNull();
    // Next scheduled time is 21:00 today
    const expectedNext = new Date('2025-06-15T21:00:00.000');
    expect(state.nextIncrementAt!.getHours()).toBe(21);
    expect(state.nextIncrementAt!.getMinutes()).toBe(0);
  });

  test('should calculate nextIncrementAt for next day when all today\'s times have passed', () => {
    // Given: schedule at 09:00 and 21:00, now is 22:00
    const timer = createPeriodicTimer({
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T10:00:00.000',
    });
    const now = new Date('2025-06-15T22:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.nextIncrementAt).not.toBeNull();
    // Next scheduled time is 09:00 tomorrow
    expect(state.nextIncrementAt!.getDate()).toBe(16);
    expect(state.nextIncrementAt!.getHours()).toBe(9);
    expect(state.nextIncrementAt!.getMinutes()).toBe(0);
  });

  test('should return null nextIncrementAt when at max', () => {
    // Given
    const timer = createPeriodicTimer({
      currentValue: 100,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T08:00:00.000',
    });
    const now = new Date('2025-06-15T10:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.nextIncrementAt).toBeNull();
  });

  test('should handle single schedule time per day', () => {
    // Given: schedule at 12:00 only, +5 each
    // From June 14 13:00 to June 15 13:00 → 1 event (June 15 12:00)
    const timer = createPeriodicTimer({
      currentValue: 10,
      maxValue: 100,
      incrementAmount: 5,
      scheduleTimes: ['12:00'],
      lastUpdatedAt: '2025-06-14T13:00:00.000',
    });
    const now = new Date('2025-06-15T13:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.currentValue).toBe(15); // 10 + 5
  });

  test('should calculate timeToMaxMs correctly', () => {
    // Given: need 15 more to reach max (85→100), +3 per event, 2 events/day
    // ceil(15/3) = 5 events needed
    const timer = createPeriodicTimer({
      currentValue: 85,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T10:00:00.000',
    });
    const now = new Date('2025-06-15T15:00:00.000');

    // When
    const state = computePeriodicIncrement(timer, now);

    // Then
    expect(state.timeToMaxMs).toBeGreaterThan(0);
    expect(state.isAtMax).toBe(false);
  });
});
