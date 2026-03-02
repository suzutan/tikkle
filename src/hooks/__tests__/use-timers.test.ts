// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimers } from '../use-timers';
import type { CreateTimerInput, UpdateTimerInput } from '@/domain/timer/types';

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

let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`),
});

describe('useTimers', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
    uuidCounter = 0;
  });

  test('should return empty timers when storage is empty', () => {
    // Given: empty localStorage

    // When
    const { result } = renderHook(() => useTimers());

    // Then
    expect(result.current.timers).toEqual([]);
  });

  test('should load existing timers from storage on mount', () => {
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

    // When
    const { result } = renderHook(() => useTimers());

    // Then
    expect(result.current.timers).toHaveLength(2);
    expect(result.current.timers[0].name).toBe('Timer 1');
    expect(result.current.timers[1].name).toBe('Timer 2');
  });

  test('should add timer to list when createTimer is called', () => {
    // Given
    const { result } = renderHook(() => useTimers());
    const input: CreateTimerInput = {
      name: 'New Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    act(() => {
      result.current.createTimer(input);
    });

    // Then
    expect(result.current.timers).toHaveLength(1);
    expect(result.current.timers[0].name).toBe('New Countdown');
    expect(result.current.timers[0].type).toBe('countdown');
  });

  test('should return created timer with generated id', () => {
    // Given
    const { result } = renderHook(() => useTimers());
    const input: CreateTimerInput = {
      name: 'New Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
    };

    // When
    let created: ReturnType<typeof result.current.createTimer>;
    act(() => {
      created = result.current.createTimer(input);
    });

    // Then
    expect(created!.id).toBe('test-uuid-1');
    expect(created!.name).toBe('New Countdown');
    expect(created!.createdAt).toBeDefined();
    expect(created!.updatedAt).toBeDefined();
  });

  test('should reflect name change when updateTimer is called', () => {
    // Given
    const storedTimers = [
      {
        id: 'timer-1',
        name: 'Old Name',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));
    const { result } = renderHook(() => useTimers());
    const updateInput: UpdateTimerInput = {
      type: 'countdown',
      name: 'Updated Name',
    };

    // When
    act(() => {
      result.current.updateTimer('timer-1', updateInput);
    });

    // Then
    expect(result.current.timers[0].name).toBe('Updated Name');
  });

  test('should return updated timer from updateTimer', () => {
    // Given
    const storedTimers = [
      {
        id: 'timer-1',
        name: 'Old Name',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));
    const { result } = renderHook(() => useTimers());

    // When
    let updated: ReturnType<typeof result.current.updateTimer>;
    act(() => {
      updated = result.current.updateTimer('timer-1', {
        type: 'countdown',
        name: 'Updated Name',
      });
    });

    // Then
    expect(updated!.name).toBe('Updated Name');
    expect(updated!.id).toBe('timer-1');
  });

  test('should remove timer from list when deleteTimer is called', () => {
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
    const { result } = renderHook(() => useTimers());

    // When
    act(() => {
      result.current.deleteTimer('timer-1');
    });

    // Then
    expect(result.current.timers).toHaveLength(1);
    expect(result.current.timers[0].id).toBe('timer-2');
  });

  test('should handle creating multiple timers sequentially', () => {
    // Given
    const { result } = renderHook(() => useTimers());

    // When
    act(() => {
      result.current.createTimer({
        name: 'Timer A',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
      });
    });
    act(() => {
      result.current.createTimer({
        name: 'Timer B',
        type: 'elapsed',
        startDate: '2025-01-01T00:00:00.000Z',
      });
    });

    // Then
    expect(result.current.timers).toHaveLength(2);
    expect(result.current.timers[0].name).toBe('Timer A');
    expect(result.current.timers[1].name).toBe('Timer B');
  });
});
