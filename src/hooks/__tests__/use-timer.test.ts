// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimer } from '../use-timer';

const mockStorage = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    mockStorage.delete(key);
  }),
  clear: vi.fn(() => {
    mockStorage.clear();
  }),
  get length() {
    return mockStorage.size;
  },
  key: vi.fn((_index: number) => null),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('useTimer', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
  });

  test('should return timer when it exists in storage', () => {
    // Given
    const storedTimers = [
      {
        id: 'timer-1',
        name: 'My Countdown',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'timer-2',
        name: 'My Elapsed',
        type: 'elapsed',
        startDate: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));

    // When
    const { result } = renderHook(() => useTimer('timer-1'));

    // Then
    expect(result.current).toBeDefined();
    expect(result.current!.id).toBe('timer-1');
    expect(result.current!.name).toBe('My Countdown');
    expect(result.current!.type).toBe('countdown');
  });

  test('should return undefined when timer does not exist in storage', () => {
    // Given: empty storage

    // When
    const { result } = renderHook(() => useTimer('non-existent'));

    // Then
    expect(result.current).toBeUndefined();
  });

  test('should return correct timer among multiple stored timers', () => {
    // Given
    const storedTimers = [
      {
        id: 'timer-1',
        name: 'Timer 1',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'timer-2',
        name: 'Timer 2',
        type: 'stamina',
        currentValue: 100,
        maxValue: 200,
        recoveryIntervalMinutes: 5,
        lastUpdatedAt: '2025-06-15T12:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));

    // When
    const { result } = renderHook(() => useTimer('timer-2'));

    // Then
    expect(result.current).toBeDefined();
    expect(result.current!.id).toBe('timer-2');
    expect(result.current!.name).toBe('Timer 2');
    expect(result.current!.type).toBe('stamina');
  });

  test('should update when id changes', () => {
    // Given
    const storedTimers = [
      {
        id: 'timer-1',
        name: 'Timer 1',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'timer-2',
        name: 'Timer 2',
        type: 'elapsed',
        startDate: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));

    // When: initially fetch timer-1, then switch to timer-2
    const { result, rerender } = renderHook(
      ({ id }) => useTimer(id),
      { initialProps: { id: 'timer-1' } },
    );
    expect(result.current!.name).toBe('Timer 1');

    rerender({ id: 'timer-2' });

    // Then
    expect(result.current!.name).toBe('Timer 2');
  });
});
