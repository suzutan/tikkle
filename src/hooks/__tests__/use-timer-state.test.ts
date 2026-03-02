// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerState } from '../use-timer-state';
import type {
  Timer,
  CountdownTimer,
  CountdownState,
  ElapsedTimer,
  ElapsedState,
  StaminaTimer,
  StaminaState,
} from '@/domain/timer/types';

describe('useTimerState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should compute initial state for countdown timer', () => {
    // Given: countdown timer with target 1 hour in the future
    const timer: CountdownTimer = {
      id: 'timer-1',
      name: 'Countdown',
      type: 'countdown',
      targetDate: '2025-06-15T13:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const { result } = renderHook(() => useTimerState(timer));

    // Then
    expect(result.current.type).toBe('countdown');
    const state = result.current as CountdownState;
    expect(state.remainingMs).toBe(3_600_000);
    expect(state.isExpired).toBe(false);
  });

  test('should compute initial state for elapsed timer', () => {
    // Given: elapsed timer started 2 hours ago
    const timer: ElapsedTimer = {
      id: 'timer-2',
      name: 'Elapsed',
      type: 'elapsed',
      startDate: '2025-06-15T10:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const { result } = renderHook(() => useTimerState(timer));

    // Then
    expect(result.current.type).toBe('elapsed');
    const state = result.current as ElapsedState;
    expect(state.elapsedMs).toBe(7_200_000);
  });

  test('should compute initial state for stamina timer', () => {
    // Given: stamina timer at 50/200
    const timer: StaminaTimer = {
      id: 'timer-3',
      name: 'Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const { result } = renderHook(() => useTimerState(timer));

    // Then
    expect(result.current.type).toBe('stamina');
    const state = result.current as StaminaState;
    expect(state.currentValue).toBe(50);
    expect(state.maxValue).toBe(200);
    expect(state.isFull).toBe(false);
  });

  test('should update state after 1 second interval', () => {
    // Given: countdown timer with target 1 hour in the future
    const timer: CountdownTimer = {
      id: 'timer-1',
      name: 'Countdown',
      type: 'countdown',
      targetDate: '2025-06-15T13:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const { result } = renderHook(() => useTimerState(timer));

    // When: advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    // Then: remaining time decreased by 1 second
    const state = result.current as CountdownState;
    expect(state.remainingMs).toBe(3_599_000);
  });

  test('should update state multiple times over several seconds', () => {
    // Given
    const timer: CountdownTimer = {
      id: 'timer-1',
      name: 'Countdown',
      type: 'countdown',
      targetDate: '2025-06-15T13:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const { result } = renderHook(() => useTimerState(timer));

    // When: advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    // Then: remaining time decreased by 5 seconds
    const state = result.current as CountdownState;
    expect(state.remainingMs).toBe(3_595_000);
  });

  test('should not throw when unmounted during active interval', () => {
    // Given
    const timer: CountdownTimer = {
      id: 'timer-1',
      name: 'Countdown',
      type: 'countdown',
      targetDate: '2025-06-15T13:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const { unmount } = renderHook(() => useTimerState(timer));

    // When: unmount and then advance time
    unmount();

    // Then: advancing time after unmount should not throw
    expect(() => {
      vi.advanceTimersByTime(3_000);
    }).not.toThrow();
  });

  test('should recompute state when timer prop changes', () => {
    // Given: start with a timer targeting 1 hour away
    const timer1: CountdownTimer = {
      id: 'timer-1',
      name: 'Timer 1',
      type: 'countdown',
      targetDate: '2025-06-15T13:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const timer2: CountdownTimer = {
      id: 'timer-2',
      name: 'Timer 2',
      type: 'countdown',
      targetDate: '2025-06-15T14:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const { result, rerender } = renderHook(
      ({ timer }) => useTimerState(timer),
      { initialProps: { timer: timer1 as Timer } },
    );
    expect((result.current as CountdownState).remainingMs).toBe(3_600_000);

    // When: switch to a timer targeting 2 hours away
    rerender({ timer: timer2 as Timer });

    // Then: state reflects the new timer
    expect((result.current as CountdownState).remainingMs).toBe(7_200_000);
  });
});
