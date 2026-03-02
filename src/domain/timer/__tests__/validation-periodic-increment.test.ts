import { describe, test, expect } from 'vitest';
import { periodicIncrementTimerSchema } from '../validation';

describe('periodicIncrementTimerSchema', () => {
  test('should accept valid periodic-increment timer input', () => {
    // Given
    const input = {
      name: 'Leve Allowances',
      type: 'periodic-increment' as const,
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = periodicIncrementTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should reject when scheduleTimes is empty', () => {
    // Given
    const input = {
      name: 'Leve Allowances',
      type: 'periodic-increment' as const,
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: [],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = periodicIncrementTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when incrementAmount is zero', () => {
    // Given
    const input = {
      name: 'Leve Allowances',
      type: 'periodic-increment' as const,
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 0,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = periodicIncrementTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when scheduleTimes contains invalid format', () => {
    // Given
    const input = {
      name: 'Leve Allowances',
      type: 'periodic-increment' as const,
      currentValue: 50,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['9:00', '25:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = periodicIncrementTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when currentValue exceeds maxValue', () => {
    // Given
    const input = {
      name: 'Leve Allowances',
      type: 'periodic-increment' as const,
      currentValue: 101,
      maxValue: 100,
      incrementAmount: 3,
      scheduleTimes: ['09:00', '21:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = periodicIncrementTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});
