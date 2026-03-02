import { describe, test, expect } from 'vitest';
import { createTimerSchema } from '../validation';

describe('createTimerSchema (discriminated union)', () => {
  test('should accept countdown timer input', () => {
    // Given
    const input = {
      name: 'Expiry',
      type: 'countdown' as const,
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should accept elapsed timer input', () => {
    // Given
    const input = {
      name: 'Since',
      type: 'elapsed' as const,
      startDate: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should accept stamina timer input', () => {
    // Given
    const input = {
      name: 'Stamina',
      type: 'stamina' as const,
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should reject unknown timer type', () => {
    // Given
    const input = {
      name: 'Unknown',
      type: 'unknown',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when type field is missing', () => {
    // Given
    const input = {
      name: 'No Type',
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject countdown-specific fields on elapsed type', () => {
    // Given: elapsed type but with targetDate instead of startDate
    const input = {
      name: 'Wrong Fields',
      type: 'elapsed' as const,
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject stamina timer when currentValue exceeds maxValue', () => {
    // Given
    const input = {
      name: 'Stamina Overflow',
      type: 'stamina' as const,
      currentValue: 201,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject periodic-increment timer when currentValue exceeds maxValue', () => {
    // Given
    const input = {
      name: 'Leve Overflow',
      type: 'periodic-increment' as const,
      currentValue: 101,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = createTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});
