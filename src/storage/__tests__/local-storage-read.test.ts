import { describe, test, expect, beforeEach, vi } from 'vitest';
import { LocalStorageTimerRepository } from '../local-storage';
import { mockStorage } from './helpers/local-storage-mock';

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
});
