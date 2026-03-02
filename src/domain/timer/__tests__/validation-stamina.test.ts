import { describe, test, expect } from 'vitest';
import { staminaTimerSchema } from '../validation';

describe('staminaTimerSchema', () => {
  test('should accept valid stamina timer input', () => {
    // Given
    const input = {
      name: 'Game Stamina',
      type: 'stamina' as const,
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = staminaTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should reject when currentValue is negative', () => {
    // Given
    const input = {
      name: 'Game Stamina',
      type: 'stamina' as const,
      currentValue: -1,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = staminaTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when maxValue is zero', () => {
    // Given
    const input = {
      name: 'Game Stamina',
      type: 'stamina' as const,
      currentValue: 0,
      maxValue: 0,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = staminaTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when recoveryIntervalMinutes is zero', () => {
    // Given
    const input = {
      name: 'Game Stamina',
      type: 'stamina' as const,
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 0,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = staminaTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when currentValue exceeds maxValue', () => {
    // Given
    const input = {
      name: 'Game Stamina',
      type: 'stamina' as const,
      currentValue: 201,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = staminaTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject non-integer currentValue', () => {
    // Given
    const input = {
      name: 'Game Stamina',
      type: 'stamina' as const,
      currentValue: 50.5,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    };

    // When
    const result = staminaTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});
