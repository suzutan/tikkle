import { describe, test, expect } from 'vitest';
import { TIMER_TEMPLATES } from '../timer-templates';
import type { TimerTemplate } from '../timer-templates';

const VALID_TIMER_TYPES = [
  'countdown',
  'elapsed',
  'countdown-elapsed',
  'stamina',
  'periodic-increment',
] as const;

const SCHEDULE_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

describe('TIMER_TEMPLATES', () => {
  test('should export at least one template', () => {
    // Given: the exported templates array

    // When & Then
    expect(TIMER_TEMPLATES.length).toBeGreaterThan(0);
  });

  test('should define label and description for every template', () => {
    // Given: all templates

    // When & Then
    for (const template of TIMER_TEMPLATES) {
      expect(template.label.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
    }
  });

  test('should include valid timer type in defaults for every template', () => {
    // Given: all templates

    // When & Then
    for (const template of TIMER_TEMPLATES) {
      expect(VALID_TIMER_TYPES).toContain(template.defaults.type);
    }
  });

  test('should define a non-empty name in defaults for every template', () => {
    // Given: all templates

    // When & Then
    for (const template of TIMER_TEMPLATES) {
      expect(template.defaults.name.length).toBeGreaterThan(0);
    }
  });
});

describe('countdown templates', () => {
  const countdownTemplates = TIMER_TEMPLATES.filter(
    (t): t is TimerTemplate & { defaults: { type: 'countdown'; durationMinutes: number } } =>
      t.defaults.type === 'countdown',
  );

  test('should have positive durationMinutes', () => {
    // Given: countdown templates exist in the collection
    expect(countdownTemplates.length).toBeGreaterThan(0);

    // When & Then
    for (const template of countdownTemplates) {
      expect(template.defaults.durationMinutes).toBeGreaterThan(0);
    }
  });
});

describe('countdown-elapsed templates', () => {
  const countdownElapsedTemplates = TIMER_TEMPLATES.filter(
    (t): t is TimerTemplate & { defaults: { type: 'countdown-elapsed'; durationMinutes: number } } =>
      t.defaults.type === 'countdown-elapsed',
  );

  test('should have positive durationMinutes when present', () => {
    // Given: templates may or may not exist for this type
    // When & Then
    for (const template of countdownElapsedTemplates) {
      expect(template.defaults.durationMinutes).toBeGreaterThan(0);
    }
  });
});

describe('stamina templates', () => {
  const staminaTemplates = TIMER_TEMPLATES.filter(
    (t): t is TimerTemplate & {
      defaults: {
        type: 'stamina';
        currentValue: number;
        maxValue: number;
        recoveryIntervalMinutes: number;
      };
    } => t.defaults.type === 'stamina',
  );

  test('should have currentValue not exceeding maxValue', () => {
    // Given: stamina templates exist
    expect(staminaTemplates.length).toBeGreaterThan(0);

    // When & Then
    for (const template of staminaTemplates) {
      expect(template.defaults.currentValue).toBeLessThanOrEqual(
        template.defaults.maxValue,
      );
    }
  });

  test('should have positive maxValue', () => {
    // Given & When & Then
    for (const template of staminaTemplates) {
      expect(template.defaults.maxValue).toBeGreaterThan(0);
    }
  });

  test('should have positive recoveryIntervalMinutes', () => {
    // Given & When & Then
    for (const template of staminaTemplates) {
      expect(template.defaults.recoveryIntervalMinutes).toBeGreaterThan(0);
    }
  });
});

describe('periodic-increment templates', () => {
  const periodicTemplates = TIMER_TEMPLATES.filter(
    (t): t is TimerTemplate & {
      defaults: {
        type: 'periodic-increment';
        currentValue: number;
        maxValue: number;
        incrementAmount: number;
        scheduleTimes: string[];
      };
    } => t.defaults.type === 'periodic-increment',
  );

  test('should have currentValue not exceeding maxValue', () => {
    // Given: periodic-increment templates exist
    expect(periodicTemplates.length).toBeGreaterThan(0);

    // When & Then
    for (const template of periodicTemplates) {
      expect(template.defaults.currentValue).toBeLessThanOrEqual(
        template.defaults.maxValue,
      );
    }
  });

  test('should have positive incrementAmount', () => {
    // Given & When & Then
    for (const template of periodicTemplates) {
      expect(template.defaults.incrementAmount).toBeGreaterThan(0);
    }
  });

  test('should have non-empty scheduleTimes with valid HH:MM format', () => {
    // Given & When & Then
    for (const template of periodicTemplates) {
      expect(template.defaults.scheduleTimes.length).toBeGreaterThan(0);
      for (const time of template.defaults.scheduleTimes) {
        expect(time).toMatch(SCHEDULE_TIME_PATTERN);
      }
    }
  });
});
