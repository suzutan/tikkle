import { describe, test, expect, beforeEach, vi } from 'vitest';
import { LocalStorageTimerRepository } from '../local-storage';
import type { UpdateTimerInput } from '../../domain/timer/types';
import { mockStorage } from './helpers/local-storage-mock';

describe('LocalStorageTimerRepository', () => {
  let repository: LocalStorageTimerRepository;

  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
    repository = new LocalStorageTimerRepository();
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
});
