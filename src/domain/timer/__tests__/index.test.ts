import { describe, test, expect } from 'vitest';
import {
  computeTimerState,
  formatDuration,
  formatDurationCompact,
  formatFraction,
  createTimerSchema,
} from '../index';
import type {
  Timer,
  TimerState,
  CreateTimerInput,
  UpdateTimerInput,
  CountdownTimer,
  ElapsedTimer,
  CountdownElapsedTimer,
  StaminaTimer,
  PeriodicIncrementTimer,
  CountdownState,
  ElapsedState,
  CountdownElapsedState,
  StaminaState,
  PeriodicIncrementState,
} from '../index';

describe('domain/timer barrel file', () => {
  describe('function re-exports', () => {
    test('should export computeTimerState as a function', () => {
      expect(typeof computeTimerState).toBe('function');
    });

    test('should export formatDuration as a function', () => {
      expect(typeof formatDuration).toBe('function');
    });

    test('should export formatDurationCompact as a function', () => {
      expect(typeof formatDurationCompact).toBe('function');
    });

    test('should export formatFraction as a function', () => {
      expect(typeof formatFraction).toBe('function');
    });

    test('should export createTimerSchema as an object', () => {
      expect(createTimerSchema).toBeDefined();
      expect(typeof createTimerSchema.safeParse).toBe('function');
    });
  });

  describe('type re-exports (compile-time verification)', () => {
    test('should export Timer union type', () => {
      // Given: a value matching the CountdownTimer variant
      const timer: Timer = {
        id: 'test',
        name: 'Test',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      // Then: type annotation compiles and value is valid
      expect(timer.type).toBe('countdown');
    });

    test('should export TimerState union type', () => {
      // Given: a value matching the CountdownState variant
      const state: TimerState = {
        type: 'countdown',
        remainingMs: 1000,
        isExpired: false,
      };

      // Then
      expect(state.type).toBe('countdown');
    });

    test('should export CreateTimerInput union type', () => {
      // Given
      const input: CreateTimerInput = {
        name: 'Test',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
      };

      // Then
      expect(input.type).toBe('countdown');
    });

    test('should export UpdateTimerInput union type', () => {
      // Given
      const input: UpdateTimerInput = {
        type: 'countdown',
        name: 'Updated',
      };

      // Then
      expect(input.type).toBe('countdown');
    });

    test('should export all specific Timer variant types', () => {
      // Given: values typed with each variant
      const countdown: CountdownTimer = {
        id: 'c', name: 'C', type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };
      const elapsed: ElapsedTimer = {
        id: 'e', name: 'E', type: 'elapsed',
        startDate: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };
      const countdownElapsed: CountdownElapsedTimer = {
        id: 'ce', name: 'CE', type: 'countdown-elapsed',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };
      const stamina: StaminaTimer = {
        id: 's', name: 'S', type: 'stamina',
        currentValue: 50, maxValue: 200, recoveryIntervalMinutes: 5,
        lastUpdatedAt: '2025-06-15T12:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };
      const periodic: PeriodicIncrementTimer = {
        id: 'p', name: 'P', type: 'periodic-increment',
        currentValue: 50, maxValue: 100, incrementAmount: 3,
        scheduleTimes: ['09:00'], lastUpdatedAt: '2025-06-15T12:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      // Then: all variants have the expected type discriminant
      expect(countdown.type).toBe('countdown');
      expect(elapsed.type).toBe('elapsed');
      expect(countdownElapsed.type).toBe('countdown-elapsed');
      expect(stamina.type).toBe('stamina');
      expect(periodic.type).toBe('periodic-increment');
    });

    test('should export all specific TimerState variant types', () => {
      // Given
      const countdownState: CountdownState = {
        type: 'countdown', remainingMs: 1000, isExpired: false,
      };
      const elapsedState: ElapsedState = {
        type: 'elapsed', elapsedMs: 5000,
      };
      const ceState: CountdownElapsedState = {
        type: 'countdown-elapsed', mode: 'countdown', ms: 3000,
      };
      const staminaState: StaminaState = {
        type: 'stamina', currentValue: 50, maxValue: 200,
        isFull: false, nextRecoveryMs: 60000, timeToFullMs: 3600000,
      };
      const periodicState: PeriodicIncrementState = {
        type: 'periodic-increment', currentValue: 50, maxValue: 100,
        isAtMax: false, nextIncrementAt: new Date(), timeToMaxMs: 7200000,
      };

      // Then
      expect(countdownState.type).toBe('countdown');
      expect(elapsedState.type).toBe('elapsed');
      expect(ceState.type).toBe('countdown-elapsed');
      expect(staminaState.type).toBe('stamina');
      expect(periodicState.type).toBe('periodic-increment');
    });
  });

  describe('re-exported function behavior', () => {
    test('should compute countdown state via re-exported computeTimerState', () => {
      // Given
      const timer: CountdownTimer = {
        id: 'test', name: 'Test', type: 'countdown',
        targetDate: '2025-06-15T13:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };
      const now = new Date('2025-06-15T12:00:00.000Z');

      // When
      const state = computeTimerState(timer, now);

      // Then
      expect(state.type).toBe('countdown');
      expect((state as CountdownState).remainingMs).toBe(3_600_000);
    });

    test('should format duration via re-exported formatDuration', () => {
      // Given
      const ms = 3_661_000;

      // When
      const formatted = formatDuration(ms);

      // Then
      expect(formatted).toBe('1時間 01分 01秒');
    });

    test('should format compact via re-exported formatDurationCompact', () => {
      // Given
      const ms = 3_661_000;

      // When
      const formatted = formatDurationCompact(ms);

      // Then
      expect(formatted).toBe('1h 01m 01s');
    });

    test('should format fraction via re-exported formatFraction', () => {
      // Given & When
      const result = formatFraction(50, 200);

      // Then
      expect(result).toBe('50 / 200');
    });
  });
});
