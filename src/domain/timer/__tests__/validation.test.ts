import { describe, test, expect } from 'vitest';
import {
  countdownTimerSchema,
  elapsedTimerSchema,
  countdownElapsedTimerSchema,
  staminaTimerSchema,
  periodicIncrementTimerSchema,
  createTimerSchema,
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
