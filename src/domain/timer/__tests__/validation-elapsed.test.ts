import { describe, test, expect } from 'vitest';
import { elapsedTimerSchema } from '../validation';

describe('elapsedTimerSchema', () => {
  test('should accept valid elapsed timer input', () => {
    // Given
    const input = {
      name: 'Since Event',
      type: 'elapsed' as const,
      startDate: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = elapsedTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  test('should reject when name is missing', () => {
    // Given
    const input = {
      type: 'elapsed' as const,
      startDate: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = elapsedTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  test('should reject when startDate is missing', () => {
    // Given
    const input = {
      name: 'Since Event',
      type: 'elapsed' as const,
    };

    // When
    const result = elapsedTimerSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});
