import { describe, test, expect } from 'vitest';
import {
  countdownTimerSchema,
  countdownElapsedTimerSchema,
} from '../validation';

describe('countdownTimerSchema', () => {
  test('should accept valid countdown timer input', () => {
    // Given
    const input = {
      name: 'Expiry Timer',
      type: 'countdown' as const,
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    const result = countdownTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should reject when name is empty', () => {
    // Given
    const input = {
      name: '',
      type: 'countdown' as const,
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    const result = countdownTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when targetDate is missing', () => {
    // Given
    const input = {
      name: 'Expiry Timer',
      type: 'countdown' as const,
    };

    // When
    const result = countdownTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when targetDate is not a valid ISO string', () => {
    // Given
    const input = {
      name: 'Expiry Timer',
      type: 'countdown' as const,
      targetDate: 'not-a-date',
    };

    // When
    const result = countdownTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});

describe('countdownElapsedTimerSchema', () => {
  test('should accept valid countdown-elapsed timer input', () => {
    // Given
    const input = {
      name: 'Event Timer',
      type: 'countdown-elapsed' as const,
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    const result = countdownElapsedTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should reject when targetDate is missing', () => {
    // Given
    const input = {
      name: 'Event Timer',
      type: 'countdown-elapsed' as const,
    };

    // When
    const result = countdownElapsedTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});
