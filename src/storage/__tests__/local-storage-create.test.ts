import { describe, test, expect, beforeEach, vi } from 'vitest';
import { LocalStorageTimerRepository } from '../local-storage';
import type { CreateTimerInput } from '../../domain/timer/types';
import { mockStorage } from './helpers/local-storage-mock';

describe('LocalStorageTimerRepository', () => {
  let repository: LocalStorageTimerRepository;

  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
    repository = new LocalStorageTimerRepository();
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
});
