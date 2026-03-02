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
