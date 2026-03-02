import { describe, test, expect, beforeEach, vi } from 'vitest';
import { LocalStorageTimerRepository } from '../local-storage';
import type { CreateTimerInput, UpdateTimerInput } from '../../domain/timer/types';

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

// Stable UUID and timestamp for deterministic tests
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-1234'),
});

describe('LocalStorageTimerRepository', () => {
  let repository: LocalStorageTimerRepository;

  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
    repository = new LocalStorageTimerRepository();
  });

  describe('getAll', () => {
    test('should return empty array when no timers exist', () => {
      // Given: empty storage

      // When
      const timers = repository.getAll();

      // Then
      expect(timers).toEqual([]);
    });

    test('should return all stored timers', () => {
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
      const timers = repository.getAll();

      // Then
      expect(timers).toHaveLength(2);
      expect(timers[0].name).toBe('Timer 1');
      expect(timers[1].name).toBe('Timer 2');
    });
  });

  describe('getById', () => {
    test('should return timer by id', () => {
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
      ];
      mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));

      // When
      const timer = repository.getById('timer-1');

      // Then
      expect(timer).toBeDefined();
      expect(timer!.id).toBe('timer-1');
      expect(timer!.name).toBe('Timer 1');
    });

    test('should return undefined for non-existent id', () => {
      // Given: empty storage

      // When
      const timer = repository.getById('non-existent');

      // Then
      expect(timer).toBeUndefined();
    });
  });

  describe('create', () => {
    test('should create a countdown timer with generated id and timestamps', () => {
      // Given
      const input: CreateTimerInput = {
        name: 'New Countdown',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
      };

      // When
      const timer = repository.create(input);

      // Then
      expect(timer.id).toBe('test-uuid-1234');
      expect(timer.name).toBe('New Countdown');
      expect(timer.type).toBe('countdown');
      expect(timer.createdAt).toBeDefined();
      expect(timer.updatedAt).toBeDefined();
    });

    test('should persist the created timer to localStorage', () => {
      // Given
      const input: CreateTimerInput = {
        name: 'New Countdown',
        type: 'countdown',
        targetDate: '2025-12-31T23:59:59.000Z',
      };

      // When
      repository.create(input);

      // Then
      const stored = mockStorage.get('tikkle-timers');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('New Countdown');
    });

    test('should create a stamina timer with all fields', () => {
      // Given
      const input: CreateTimerInput = {
        name: 'Game Stamina',
        type: 'stamina',
        currentValue: 50,
        maxValue: 200,
        recoveryIntervalMinutes: 5,
        lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      };

      // When
      const timer = repository.create(input);

      // Then
      expect(timer.type).toBe('stamina');
      expect(timer.name).toBe('Game Stamina');
    });

    test('should create a periodic-increment timer with schedule', () => {
      // Given
      const input: CreateTimerInput = {
        name: 'Leve Allowances',
        type: 'periodic-increment',
        currentValue: 50,
        maxValue: 100,
        incrementAmount: 3,
        scheduleTimes: ['09:00', '21:00'],
        lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      };

      // When
      const timer = repository.create(input);

      // Then
      expect(timer.type).toBe('periodic-increment');
      expect(timer.name).toBe('Leve Allowances');
    });
  });

  describe('update', () => {
    test('should update timer fields', () => {
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
      repository = new LocalStorageTimerRepository();

      const updateInput: UpdateTimerInput = {
        type: 'countdown',
        name: 'New Name',
      };

      // When
      const updated = repository.update('timer-1', updateInput);

      // Then
      expect(updated.name).toBe('New Name');
      expect(updated.updatedAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    test('should throw when updating non-existent timer', () => {
      // Given: empty storage
      const updateInput: UpdateTimerInput = {
        type: 'countdown',
        name: 'New Name',
      };

      // When & Then
      expect(() => {
        repository.update('non-existent', updateInput);
      }).toThrow();
    });

    test('should throw when updating with mismatched timer type', () => {
      // Given: a countdown timer in storage
      const storedTimers = [
        {
          id: 'timer-1',
          name: 'Countdown Timer',
          type: 'countdown',
          targetDate: '2025-12-31T23:59:59.000Z',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));
      repository = new LocalStorageTimerRepository();

      const updateInput: UpdateTimerInput = {
        type: 'elapsed',
        name: 'New Name',
      };

      // When & Then
      expect(() => {
        repository.update('timer-1', updateInput);
      }).toThrow('Timer type mismatch');
    });

    test('should persist updates to localStorage', () => {
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
      repository = new LocalStorageTimerRepository();

      // When
      repository.update('timer-1', {
        type: 'countdown',
        name: 'Updated Name',
      });

      // Then
      const stored = JSON.parse(mockStorage.get('tikkle-timers')!);
      expect(stored[0].name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    test('should remove timer by id', () => {
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
      repository = new LocalStorageTimerRepository();

      // When
      repository.delete('timer-1');

      // Then
      const remaining = repository.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('timer-2');
    });

    test('should throw when deleting non-existent timer', () => {
      // Given: empty storage

      // When & Then
      expect(() => {
        repository.delete('non-existent');
      }).toThrow();
    });

    test('should persist deletion to localStorage', () => {
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
      ];
      mockStorage.set('tikkle-timers', JSON.stringify(storedTimers));
      repository = new LocalStorageTimerRepository();

      // When
      repository.delete('timer-1');

      // Then
      const stored = JSON.parse(mockStorage.get('tikkle-timers')!);
      expect(stored).toHaveLength(0);
    });
  });
});
