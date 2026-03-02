import { describe, test, expect } from 'vitest';
import { buildInitialState, buildDefaultForType, buildFromTemplate } from '../timer-form-helpers';
import type { Timer } from '@/domain/timer/types';
import type { TimerTemplate } from '@/lib/timer-templates';

describe('buildInitialState', () => {
  test('should return countdown input when given countdown timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-1',
      name: 'My Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'My Countdown',
      type: 'countdown',
      targetDate: '2025-12-31T23:59:59.000Z',
    });
  });

  test('should return elapsed input when given elapsed timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-2',
      name: 'My Elapsed',
      type: 'elapsed',
      startDate: '2025-06-01T10:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'My Elapsed',
      type: 'elapsed',
      startDate: '2025-06-01T10:00:00.000Z',
    });
  });

  test('should return countdown-elapsed input when given countdown-elapsed timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-3',
      name: 'My Deadline',
      type: 'countdown-elapsed',
      targetDate: '2025-12-31T23:59:59.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'My Deadline',
      type: 'countdown-elapsed',
      targetDate: '2025-12-31T23:59:59.000Z',
    });
  });

  test('should return stamina input when given stamina timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-4',
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
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should return periodic-increment input when given periodic-increment timer', () => {
    // Given
    const timer: Timer = {
      id: 'timer-5',
      name: 'Daily Points',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['09:00', '18:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // When
    const result = buildInitialState(timer);

    // Then
    expect(result).toEqual({
      name: 'Daily Points',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['09:00', '18:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });
});

describe('buildDefaultForType', () => {
  const fixedDate = new Date('2025-06-15T12:00:00.000Z');

  test('should return empty countdown input when type is countdown', () => {
    // Given / When
    const result = buildDefaultForType('countdown', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'countdown',
      targetDate: '',
    });
  });

  test('should return elapsed input with current time when type is elapsed', () => {
    // Given / When
    const result = buildDefaultForType('elapsed', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'elapsed',
      startDate: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should return empty countdown-elapsed input when type is countdown-elapsed', () => {
    // Given / When
    const result = buildDefaultForType('countdown-elapsed', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'countdown-elapsed',
      targetDate: '',
    });
  });

  test('should return stamina defaults when type is stamina', () => {
    // Given / When
    const result = buildDefaultForType('stamina', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'stamina',
      currentValue: 0,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should return periodic-increment defaults when type is periodic-increment', () => {
    // Given / When
    const result = buildDefaultForType('periodic-increment', fixedDate);

    // Then
    expect(result).toEqual({
      name: '',
      type: 'periodic-increment',
      currentValue: 0,
      maxValue: 100,
      incrementAmount: 1,
      scheduleTimes: ['09:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });
});

describe('buildFromTemplate', () => {
  const fixedDate = new Date('2025-06-15T12:00:00.000Z');

  test('should create countdown input from countdown template', () => {
    // Given
    const template: TimerTemplate = {
      label: 'ポモドーロ 25分',
      description: '25分カウントダウン',
      defaults: { type: 'countdown', name: 'ポモドーロ 25分', durationMinutes: 25 },
    };

    // When
    const result = buildFromTemplate(template, fixedDate);

    // Then
    expect(result.type).toBe('countdown');
    expect(result.name).toBe('ポモドーロ 25分');
    if (result.type === 'countdown') {
      const target = new Date(result.targetDate);
      const expectedTarget = new Date(fixedDate.getTime() + 25 * 60_000);
      expect(target.getTime()).toBe(expectedTarget.getTime());
    }
  });

  test('should create elapsed input from elapsed template', () => {
    // Given
    const template: TimerTemplate = {
      label: '作業経過時間',
      description: '経過時間計測',
      defaults: { type: 'elapsed', name: '作業経過時間' },
    };

    // When
    const result = buildFromTemplate(template, fixedDate);

    // Then
    expect(result).toEqual({
      name: '作業経過時間',
      type: 'elapsed',
      startDate: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should create countdown-elapsed input from countdown-elapsed template', () => {
    // Given
    const template: TimerTemplate = {
      label: '締め切り',
      description: '締め切りカウントダウン',
      defaults: { type: 'countdown-elapsed', name: '締め切り', durationMinutes: 120 },
    };

    // When
    const result = buildFromTemplate(template, fixedDate);

    // Then
    expect(result.type).toBe('countdown-elapsed');
    expect(result.name).toBe('締め切り');
    if (result.type === 'countdown-elapsed') {
      const target = new Date(result.targetDate);
      const expectedTarget = new Date(fixedDate.getTime() + 120 * 60_000);
      expect(target.getTime()).toBe(expectedTarget.getTime());
    }
  });

  test('should create stamina input from stamina template', () => {
    // Given
    const template: TimerTemplate = {
      label: 'スタミナ',
      description: 'スタミナ回復',
      defaults: {
        type: 'stamina',
        name: 'スタミナ回復',
        currentValue: 0,
        maxValue: 200,
        recoveryIntervalMinutes: 5,
      },
    };

    // When
    const result = buildFromTemplate(template, fixedDate);

    // Then
    expect(result).toEqual({
      name: 'スタミナ回復',
      type: 'stamina',
      currentValue: 0,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });

  test('should create periodic-increment input from periodic-increment template', () => {
    // Given
    const template: TimerTemplate = {
      label: '日次ポイント',
      description: '日次増加',
      defaults: {
        type: 'periodic-increment',
        name: '日次タスクポイント',
        currentValue: 0,
        maxValue: 100,
        incrementAmount: 10,
        scheduleTimes: ['09:00', '18:00'],
      },
    };

    // When
    const result = buildFromTemplate(template, fixedDate);

    // Then
    expect(result).toEqual({
      name: '日次タスクポイント',
      type: 'periodic-increment',
      currentValue: 0,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['09:00', '18:00'],
      lastUpdatedAt: '2025-06-15T12:00:00.000Z',
    });
  });
});
