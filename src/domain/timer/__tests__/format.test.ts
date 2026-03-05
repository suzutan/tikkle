import { describe, test, expect } from 'vitest';
import {
  formatDuration,
  formatDurationCompact,
  formatFraction,
  formatDateTime,
  formatTime,
} from '../format';

describe('formatDuration', () => {
  test('should format days, hours, minutes, seconds', () => {
    // Given: 2 days, 3 hours, 45 minutes, 12 seconds
    const ms =
      2 * 86400000 + 3 * 3600000 + 45 * 60000 + 12 * 1000;

    // When
    const result = formatDuration(ms);

    // Then
    expect(result).toBe('2日 03時間 45分 12秒');
  });

  test('should format zero duration', () => {
    // Given
    const ms = 0;

    // When
    const result = formatDuration(ms);

    // Then
    expect(result).toBe('0秒');
  });

  test('should format only seconds', () => {
    // Given: 45 seconds
    const ms = 45 * 1000;

    // When
    const result = formatDuration(ms);

    // Then
    expect(result).toBe('45秒');
  });

  test('should pad subordinate units', () => {
    // Given: 5 minutes 3 seconds
    const ms = 5 * 60000 + 3 * 1000;

    // When
    const result = formatDuration(ms);

    // Then: leading unit not padded, subordinate padded
    expect(result).toBe('5分 03秒');
  });

  test('should format hours with padded trailing zeros', () => {
    // Given: exactly 2 hours
    const ms = 2 * 3600000;

    // When
    const result = formatDuration(ms);

    // Then: subordinate units shown as padded zeros
    expect(result).toBe('2時間 00分 00秒');
  });

  test('should format days with padded trailing zeros', () => {
    // Given: exactly 7 days
    const ms = 7 * 86400000;

    // When
    const result = formatDuration(ms);

    // Then: subordinate units shown as padded zeros
    expect(result).toBe('7日 00時間 00分 00秒');
  });

  test('should pad zero intermediate units for stable width', () => {
    // Given: 1 day 0 hours 0 minutes 30 seconds
    const ms = 86400000 + 30 * 1000;

    // When
    const result = formatDuration(ms);

    // Then: intermediate zeros are shown with padding
    expect(result).toBe('1日 00時間 00分 30秒');
  });

  test('should truncate sub-second precision', () => {
    // Given: 1500ms = 1 second + 500ms
    const ms = 1500;

    // When
    const result = formatDuration(ms);

    // Then
    expect(result).toBe('1秒');
  });

  test('should handle large durations', () => {
    // Given: 365 days
    const ms = 365 * 86400000;

    // When
    const result = formatDuration(ms);

    // Then
    expect(result).toBe('365日 00時間 00分 00秒');
  });
});

describe('formatDurationCompact', () => {
  test('should format days, hours, minutes, seconds in compact form', () => {
    // Given: 2 days, 3 hours, 45 minutes, 12 seconds
    const ms =
      2 * 86400000 + 3 * 3600000 + 45 * 60000 + 12 * 1000;

    // When
    const result = formatDurationCompact(ms);

    // Then
    expect(result).toBe('2d 03h 45m 12s');
  });

  test('should format zero duration in compact form', () => {
    // Given
    const ms = 0;

    // When
    const result = formatDurationCompact(ms);

    // Then
    expect(result).toBe('0s');
  });

  test('should format only seconds in compact form', () => {
    // Given
    const ms = 45 * 1000;

    // When
    const result = formatDurationCompact(ms);

    // Then
    expect(result).toBe('45s');
  });

  test('should pad zero intermediate units in compact form', () => {
    // Given: 1 day 30 seconds
    const ms = 86400000 + 30 * 1000;

    // When
    const result = formatDurationCompact(ms);

    // Then: intermediate zeros are shown with padding
    expect(result).toBe('1d 00h 00m 30s');
  });
});

describe('formatFraction', () => {
  test('should format current / max', () => {
    // Given
    const current = 85;
    const max = 100;

    // When
    const result = formatFraction(current, max);

    // Then
    expect(result).toBe('85 / 100');
  });

  test('should format zero current', () => {
    // Given
    const current = 0;
    const max = 200;

    // When
    const result = formatFraction(current, max);

    // Then
    expect(result).toBe('0 / 200');
  });

  test('should format when current equals max', () => {
    // Given
    const current = 100;
    const max = 100;

    // When
    const result = formatFraction(current, max);

    // Then
    expect(result).toBe('100 / 100');
  });
});

describe('formatDateTime', () => {
  test('should format ISO string to local datetime', () => {
    // Given: 2026-03-03T15:30:00+09:00 (JST)
    const isoString = '2026-03-03T15:30:00+09:00';

    // When
    const result = formatDateTime(isoString);

    // Then: ローカル時間でフォーマット（JSTで実行時）
    expect(result).toMatch(/2026-03-03 \d{2}:\d{2}/);
  });

  test('should pad single-digit values', () => {
    // Given: 2026-01-05T09:05:00+09:00
    const isoString = '2026-01-05T09:05:00+09:00';

    // When
    const result = formatDateTime(isoString);

    // Then
    expect(result).toMatch(/2026-01-05 \d{2}:\d{2}/);
  });
});

describe('formatTime', () => {
  test('should format ISO string to time only', () => {
    // Given: 2026-03-03T15:30:00+09:00
    const isoString = '2026-03-03T15:30:00+09:00';

    // When
    const result = formatTime(isoString);

    // Then: 時刻のみ
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  test('should pad single-digit hours and minutes', () => {
    // Given: 2026-01-05T09:05:00+09:00
    const isoString = '2026-01-05T09:05:00+09:00';

    // When
    const result = formatTime(isoString);

    // Then
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});
