import { describe, test, expect } from 'vitest';
import { computeStamina } from '../compute-stamina';
import type { StaminaTimer } from '../types';

function createStaminaTimer(overrides: {
  currentValue: number;
  maxValue: number;
  recoveryIntervalMinutes: number;
  lastUpdatedAt: string;
}): StaminaTimer {
  return {
    id: 'timer-1',
    name: 'Test Stamina',
    type: 'stamina',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computeStamina', () => {
  test('should calculate partial recovery', () => {
    // Given: 5 minutes recovery interval, 30 minutes elapsed → 6 recoveries
    const timer = createStaminaTimer({
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:30:00.000Z');

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.type).toBe('stamina');
    expect(state.currentValue).toBe(56); // 50 + 6
    expect(state.maxValue).toBe(200);
    expect(state.isFull).toBe(false);
  });

  test('should cap recovery at max value', () => {
    // Given: recovery would exceed max
    const timer = createStaminaTimer({
      currentValue: 195,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T13:00:00.000Z'); // 60 min → 12 recoveries

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(200);
    expect(state.isFull).toBe(true);
    expect(state.timeToFullMs).toBe(0);
    expect(state.nextRecoveryMs).toBe(0);
  });

  test('should return full state when already at max', () => {
    // Given
    const timer = createStaminaTimer({
      currentValue: 200,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:30:00.000Z');

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(200);
    expect(state.isFull).toBe(true);
    expect(state.timeToFullMs).toBe(0);
    expect(state.nextRecoveryMs).toBe(0);
  });

  test('should not recover when no time has elapsed', () => {
    // Given
    const lastUpdatedAt = '2025-06-15T12:00:00.000Z';
    const timer = createStaminaTimer({
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt,
    });
    const now = new Date(lastUpdatedAt);

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(50);
    expect(state.isFull).toBe(false);
  });

  test('should not recover when elapsed time is less than one interval', () => {
    // Given: 5 min interval, 4 min 59 sec elapsed
    const timer = createStaminaTimer({
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:04:59.000Z');

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(50);
  });

  test('should recover exactly 1 at interval boundary', () => {
    // Given: exactly 5 minutes elapsed with 5 min interval
    const timer = createStaminaTimer({
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:05:00.000Z');

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(51);
  });

  test('should calculate nextRecoveryMs correctly', () => {
    // Given: 5 min interval, 7 min elapsed → 1 recovery done, 3 min until next
    const timer = createStaminaTimer({
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:07:00.000Z');

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(51); // 50 + 1
    const threeMinutesMs = 3 * 60 * 1000;
    expect(state.nextRecoveryMs).toBe(threeMinutesMs);
  });

  test('should calculate timeToFullMs correctly', () => {
    // Given: need 149 more recoveries (50→200=150, but 1 already recovered at 7min)
    // currentValue after recovery: 51, remaining: 149
    // nextRecoveryMs: 3min (180000ms)
    // timeToFullMs: 3min + (149-1) * 5min = 3min + 148 * 5min = 180000 + 44400000 = 44580000
    const timer = createStaminaTimer({
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:07:00.000Z');

    // When
    const state = computeStamina(timer, now);

    // Then
    const threeMinutesMs = 3 * 60 * 1000;
    const fiveMinutesMs = 5 * 60 * 1000;
    const expectedTimeToFull =
      threeMinutesMs + (200 - 51 - 1) * fiveMinutesMs;
    expect(state.timeToFullMs).toBe(expectedTimeToFull);
  });

  test('should handle recovery interval of 1 minute', () => {
    // Given: 1 min interval, 10 min elapsed → 10 recoveries
    const timer = createStaminaTimer({
      currentValue: 0,
      maxValue: 100,
      recoveryIntervalMinutes: 1,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
    const now = new Date('2025-06-15T12:10:00.000Z');

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(10);
  });

  test('should use recoveryIntervalSeconds when provided (7分12秒 example)', () => {
    // Given: 7分12秒 (432秒) interval, 14分24秒 (864秒) elapsed → 2 recoveries
    const timer: StaminaTimer = {
      id: 'timer-1',
      name: 'Arknights Endfield Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 7, // This should be ignored
      recoveryIntervalSeconds: 432, // 7分12秒
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const now = new Date('2025-06-15T12:14:24.000Z'); // 14分24秒後

    // When
    const state = computeStamina(timer, now);

    // Then: 50 + 2 = 52
    expect(state.currentValue).toBe(52);
    expect(state.isFull).toBe(false);
  });

  test('should prioritize recoveryIntervalSeconds over recoveryIntervalMinutes', () => {
    // Given: recoveryIntervalSeconds と recoveryIntervalMinutes の両方が設定されている
    const timer: StaminaTimer = {
      id: 'timer-1',
      name: 'Test Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5, // これは無視される
      recoveryIntervalSeconds: 300, // 5分 = 300秒
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const now = new Date('2025-06-15T12:10:00.000Z'); // 10分後

    // When
    const state = computeStamina(timer, now);

    // Then: 50 + 2 = 52 (recoveryIntervalSeconds=300秒を使用)
    expect(state.currentValue).toBe(52);
  });

  test('should fallback to recoveryIntervalMinutes when recoveryIntervalSeconds is not provided', () => {
    // Given: recoveryIntervalSeconds が undefined（後方互換性）
    const timer: StaminaTimer = {
      id: 'timer-1',
      name: 'Test Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      recoveryIntervalSeconds: undefined, // 明示的に undefined
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const now = new Date('2025-06-15T12:10:00.000Z'); // 10分後

    // When
    const state = computeStamina(timer, now);

    // Then: 50 + 2 = 52 (recoveryIntervalMinutes=5分を使用)
    expect(state.currentValue).toBe(52);
  });

  test('should calculate nextRecoveryMs correctly with recoveryIntervalSeconds', () => {
    // Given: 432秒 (7分12秒) interval, 500秒 elapsed → 1 recovery, 364秒後に次回
    // 500秒 / 432秒 = 1余り68秒
    // 次回まで: 432秒 - 68秒 = 364秒
    const timer: StaminaTimer = {
      id: 'timer-1',
      name: 'Test Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 7,
      recoveryIntervalSeconds: 432, // 7分12秒
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const now = new Date('2025-06-15T12:08:20.000Z'); // 500秒後

    // When
    const state = computeStamina(timer, now);

    // Then
    expect(state.currentValue).toBe(51); // 50 + 1
    expect(state.nextRecoveryMs).toBe(364 * 1000); // 364秒
  });

  test('should calculate timeToFullMs correctly with recoveryIntervalSeconds', () => {
    // Given: 432秒 (7分12秒) interval, need to recover from 50 to 200 (150 recoveries)
    // 500秒経過で1回復済み、残り149回復必要
    // nextRecoveryMs: 364秒
    // timeToFullMs: 364秒 + (149-1) * 432秒
    const timer: StaminaTimer = {
      id: 'timer-1',
      name: 'Test Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 7,
      recoveryIntervalSeconds: 432, // 7分12秒
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const now = new Date('2025-06-15T12:08:20.000Z'); // 500秒後

    // When
    const state = computeStamina(timer, now);

    // Then
    // currentValue: 51, maxValue: 200, remaining: 149
    // nextRecoveryMs: 364000ms
    // timeToFullMs: 364000 + (149-1) * 432000 = 364000 + 148 * 432000
    const expectedTimeToFull = 364 * 1000 + (200 - 51 - 1) * 432 * 1000;
    expect(state.timeToFullMs).toBe(expectedTimeToFull);
  });
});
