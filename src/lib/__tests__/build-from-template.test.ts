import { describe, test, expect } from 'vitest';
import { buildFromTemplate } from '../timer-form-helpers';
import type { TimerTemplate } from '@/lib/timer-templates';

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
