import { describe, test, expect } from 'vitest';
import { datetimeLocalToISO, isoToDatetimeLocal } from '../timezone';

describe('datetimeLocalToISO', () => {
  test('should interpret datetime-local value as JST and convert to UTC ISO', () => {
    // Given: 2026-03-03T12:00 JST = 2026-03-03T03:00 UTC
    const input = '2026-03-03T12:00';

    // When
    const result = datetimeLocalToISO(input);

    // Then
    expect(result).toBe('2026-03-03T03:00:00.000Z');
  });

  test('should handle midnight JST crossing date boundary', () => {
    // Given: 2026-03-03T00:00 JST = 2026-03-02T15:00 UTC (previous day)
    const input = '2026-03-03T00:00';

    // When
    const result = datetimeLocalToISO(input);

    // Then
    expect(result).toBe('2026-03-02T15:00:00.000Z');
  });

  test('should handle JST time that stays on same UTC date', () => {
    // Given: 2026-03-03T23:30 JST = 2026-03-03T14:30 UTC
    const input = '2026-03-03T23:30';

    // When
    const result = datetimeLocalToISO(input);

    // Then
    expect(result).toBe('2026-03-03T14:30:00.000Z');
  });
});

describe('isoToDatetimeLocal', () => {
  test('should convert UTC ISO string to JST datetime-local value', () => {
    // Given: 2026-03-03T03:00 UTC = 2026-03-03T12:00 JST
    const input = '2026-03-03T03:00:00.000Z';

    // When
    const result = isoToDatetimeLocal(input);

    // Then
    expect(result).toBe('2026-03-03T12:00');
  });

  test('should handle UTC time that crosses date boundary in JST', () => {
    // Given: 2026-03-02T15:00 UTC = 2026-03-03T00:00 JST (next day)
    const input = '2026-03-02T15:00:00.000Z';

    // When
    const result = isoToDatetimeLocal(input);

    // Then
    expect(result).toBe('2026-03-03T00:00');
  });

  test('should handle UTC time that stays on same JST date', () => {
    // Given: 2026-03-03T14:30 UTC = 2026-03-03T23:30 JST
    const input = '2026-03-03T14:30:00.000Z';

    // When
    const result = isoToDatetimeLocal(input);

    // Then
    expect(result).toBe('2026-03-03T23:30');
  });
});

describe('round-trip conversion', () => {
  test('datetimeLocalToISO → isoToDatetimeLocal should return original value', () => {
    // Given
    const original = '2026-07-15T09:30';

    // When
    const iso = datetimeLocalToISO(original);
    const result = isoToDatetimeLocal(iso);

    // Then
    expect(result).toBe(original);
  });

  test('isoToDatetimeLocal → datetimeLocalToISO should return original value', () => {
    // Given
    const original = '2026-07-15T00:30:00.000Z';

    // When
    const local = isoToDatetimeLocal(original);
    const result = datetimeLocalToISO(local);

    // Then
    expect(result).toBe(original);
  });
});
