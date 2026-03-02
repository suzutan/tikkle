import { describe, test, expect } from 'vitest';
import { buildDefaultForType } from '../timer-form-helpers';

describe('buildDefaultForType', () => {
  const fixedDate = new Date('2025-06-15T12:00:00.000Z');

  test('should return empty countdown input when type is countdown', () => {
    // Given / When
    const result = buildDefaultForType('countdown', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'countdown',
      targetDate: '',
    });
  });

  test('should return elapsed input with current time when type is elapsed', () => {
    // Given / When
    const result = buildDefaultForType('elapsed', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'elapsed',
      startDate: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should return empty countdown-elapsed input when type is countdown-elapsed', () => {
    // Given / When
    const result = buildDefaultForType('countdown-elapsed', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'countdown-elapsed',
      targetDate: '',
    });
  });

  test('should return stamina defaults when type is stamina', () => {
    // Given / When
    const result = buildDefaultForType('stamina', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'stamina',
      currentValue: 0,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should return periodic-increment defaults when type is periodic-increment', () => {
    // Given / When
    const result = buildDefaultForType('periodic-increment', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'periodic-increment',
      currentValue: 0,
      maxValue: 100,
      incrementAmount: 1,
      scheduleTimes: ['09:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });
});
