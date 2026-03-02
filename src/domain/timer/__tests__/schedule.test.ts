import { describe, test, expect } from 'vitest';
import {
  countScheduledEvents,
  findNextScheduledTime,
} from '../schedule';

describe('countScheduledEvents', () => {
  test('should count events within the same day', () => {
    // Given: schedule at 09:00 and 21:00, from 08:00 to 22:00 on same day
    const scheduleTimes = ['09:00', '21:00'];
    const from = new Date('2025-06-15T08:00:00.000');
    const to = new Date('2025-06-15T22:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then: both 09:00 and 21:00 occurred
    expect(count).toBe(2);
  });

  test('should count events across multiple days', () => {
    // Given: schedule at 09:00 and 21:00, spanning 3 days
    const scheduleTimes = ['09:00', '21:00'];
    const from = new Date('2025-06-13T10:00:00.000');
    const to = new Date('2025-06-15T10:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then: Jun 13 21:00, Jun 14 09:00, Jun 14 21:00, Jun 15 09:00 = 4 events
    expect(count).toBe(4);
  });

  test('should return 0 when no events in period', () => {
    // Given: schedule at 09:00 and 21:00, from 10:00 to 20:00
    const scheduleTimes = ['09:00', '21:00'];
    const from = new Date('2025-06-15T10:00:00.000');
    const to = new Date('2025-06-15T20:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then
    expect(count).toBe(0);
  });

  test('should exclude event exactly at from time', () => {
    // Given: event at 09:00, from is exactly 09:00
    const scheduleTimes = ['09:00'];
    const from = new Date('2025-06-15T09:00:00.000');
    const to = new Date('2025-06-15T22:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then: event at from is excluded (from < eventTime <= to)
    expect(count).toBe(0);
  });

  test('should include event exactly at to time', () => {
    // Given: event at 21:00, to is exactly 21:00
    const scheduleTimes = ['21:00'];
    const from = new Date('2025-06-15T08:00:00.000');
    const to = new Date('2025-06-15T21:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then: event at to is included (from < eventTime <= to)
    expect(count).toBe(1);
  });

  test('should handle single schedule time across multiple days', () => {
    // Given: schedule at 12:00 only, 3 full days
    const scheduleTimes = ['12:00'];
    const from = new Date('2025-06-13T00:00:00.000');
    const to = new Date('2025-06-16T00:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then: Jun 13 12:00, Jun 14 12:00, Jun 15 12:00 = 3
    expect(count).toBe(3);
  });

  test('should handle many schedule times in a day', () => {
    // Given: schedule every 6 hours
    const scheduleTimes = ['00:00', '06:00', '12:00', '18:00'];
    const from = new Date('2025-06-15T00:00:00.000');
    const to = new Date('2025-06-16T00:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then: 06:00, 12:00, 18:00 on Jun 15 + 00:00 on Jun 16 = 4
    // (00:00 on Jun 15 is excluded because it equals from)
    expect(count).toBe(4);
  });

  test('should return 0 when from equals to', () => {
    // Given
    const scheduleTimes = ['09:00', '21:00'];
    const from = new Date('2025-06-15T09:00:00.000');
    const to = new Date('2025-06-15T09:00:00.000');

    // When
    const count = countScheduledEvents(scheduleTimes, from, to);

    // Then
    expect(count).toBe(0);
  });
});

describe('findNextScheduledTime', () => {
  test('should return next time today when available', () => {
    // Given: schedule at 09:00 and 21:00, now is 15:00
    const scheduleTimes = ['09:00', '21:00'];
    const now = new Date('2025-06-15T15:00:00.000');

    // When
    const next = findNextScheduledTime(scheduleTimes, now);

    // Then: next scheduled is 21:00 today
    expect(next.getFullYear()).toBe(2025);
    expect(next.getMonth()).toBe(5); // June (0-indexed)
    expect(next.getDate()).toBe(15);
    expect(next.getHours()).toBe(21);
    expect(next.getMinutes()).toBe(0);
  });

  test('should return first time tomorrow when all today\'s times have passed', () => {
    // Given: schedule at 09:00 and 21:00, now is 22:00
    const scheduleTimes = ['09:00', '21:00'];
    const now = new Date('2025-06-15T22:00:00.000');

    // When
    const next = findNextScheduledTime(scheduleTimes, now);

    // Then: next scheduled is 09:00 tomorrow
    expect(next.getDate()).toBe(16);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
  });

  test('should return next time when now is exactly at a schedule time', () => {
    // Given: schedule at 09:00 and 21:00, now is exactly 09:00
    const scheduleTimes = ['09:00', '21:00'];
    const now = new Date('2025-06-15T09:00:00.000');

    // When
    const next = findNextScheduledTime(scheduleTimes, now);

    // Then: 09:00 is current, next is 21:00 today
    expect(next.getDate()).toBe(15);
    expect(next.getHours()).toBe(21);
    expect(next.getMinutes()).toBe(0);
  });

  test('should return tomorrow first time when now is exactly at last schedule time', () => {
    // Given: schedule at 09:00 and 21:00, now is exactly 21:00
    const scheduleTimes = ['09:00', '21:00'];
    const now = new Date('2025-06-15T21:00:00.000');

    // When
    const next = findNextScheduledTime(scheduleTimes, now);

    // Then: next is 09:00 tomorrow
    expect(next.getDate()).toBe(16);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
  });

  test('should handle single schedule time', () => {
    // Given: schedule at 12:00 only, now is 10:00
    const scheduleTimes = ['12:00'];
    const now = new Date('2025-06-15T10:00:00.000');

    // When
    const next = findNextScheduledTime(scheduleTimes, now);

    // Then: 12:00 today
    expect(next.getDate()).toBe(15);
    expect(next.getHours()).toBe(12);
    expect(next.getMinutes()).toBe(0);
  });

  test('should handle single schedule time after passing', () => {
    // Given: schedule at 12:00 only, now is 13:00
    const scheduleTimes = ['12:00'];
    const now = new Date('2025-06-15T13:00:00.000');

    // When
    const next = findNextScheduledTime(scheduleTimes, now);

    // Then: 12:00 tomorrow
    expect(next.getDate()).toBe(16);
    expect(next.getHours()).toBe(12);
    expect(next.getMinutes()).toBe(0);
  });

  test('should return earliest time when schedule is not sorted', () => {
    // Given: schedule times in unsorted order
    const scheduleTimes = ['21:00', '09:00', '15:00'];
    const now = new Date('2025-06-15T10:00:00.000');

    // When
    const next = findNextScheduledTime(scheduleTimes, now);

    // Then: next is 15:00 today (earliest after 10:00)
    expect(next.getHours()).toBe(15);
    expect(next.getMinutes()).toBe(0);
  });
});
