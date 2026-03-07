import type { Timer, CreateTimerInput } from '@/domain/timer/types';
import type { TimerTemplate } from '@/lib/timer-templates';

export function buildInitialState(timer: Timer): CreateTimerInput {
  switch (timer.type) {
    case 'countdown':
      return { name: timer.name, type: 'countdown', targetDate: timer.targetDate };
    case 'elapsed':
      return { name: timer.name, type: 'elapsed', startDate: timer.startDate };
    case 'countdown-elapsed':
      return { name: timer.name, type: 'countdown-elapsed', targetDate: timer.targetDate };
    case 'stamina':
      return {
        name: timer.name, type: 'stamina',
        currentValue: timer.currentValue, maxValue: timer.maxValue,
        recoveryIntervalMinutes: timer.recoveryIntervalMinutes,
        lastUpdatedAt: timer.lastUpdatedAt,
      };
    case 'periodic-increment':
      return {
        name: timer.name, type: 'periodic-increment',
        currentValue: timer.currentValue, maxValue: timer.maxValue,
        incrementAmount: timer.incrementAmount,
        scheduleTimes: timer.scheduleTimes,
        lastUpdatedAt: timer.lastUpdatedAt,
      };
  }
}

export function buildDefaultForType(type: CreateTimerInput['type'], now: Date): CreateTimerInput {
  const isoNow = now.toISOString();
  switch (type) {
    case 'countdown':
      return { name: '', type: 'countdown', targetDate: '' };
    case 'elapsed':
      return { name: '', type: 'elapsed', startDate: isoNow };
    case 'countdown-elapsed':
      return { name: '', type: 'countdown-elapsed', targetDate: '' };
    case 'stamina':
      return { name: '', type: 'stamina', currentValue: 0, maxValue: 100, recoveryIntervalMinutes: 5, lastUpdatedAt: isoNow };
    case 'periodic-increment':
      return { name: '', type: 'periodic-increment', currentValue: 0, maxValue: 100, incrementAmount: 1, scheduleTimes: ['09:00'], lastUpdatedAt: isoNow };
  }
}

export function buildDuplicateInput(timer: Timer): CreateTimerInput {
  const input = buildInitialState(timer);
  input.name = `${timer.name}（コピー）`;
  if (timer.tags && timer.tags.length > 0) {
    input.tags = [...timer.tags];
  }
  return input;
}

export function buildFromTemplate(template: TimerTemplate, now: Date): CreateTimerInput {
  const isoNow = now.toISOString();
  const defaults = template.defaults;

  switch (defaults.type) {
    case 'countdown': {
      const targetDate = new Date(now.getTime() + defaults.durationMinutes * 60_000).toISOString();
      return { name: defaults.name, type: 'countdown', targetDate };
    }
    case 'elapsed':
      return { name: defaults.name, type: 'elapsed', startDate: isoNow };
    case 'countdown-elapsed': {
      const targetDate = new Date(now.getTime() + defaults.durationMinutes * 60_000).toISOString();
      return { name: defaults.name, type: 'countdown-elapsed', targetDate };
    }
    case 'stamina':
      return {
        name: defaults.name, type: 'stamina',
        currentValue: defaults.currentValue, maxValue: defaults.maxValue,
        recoveryIntervalMinutes: defaults.recoveryIntervalMinutes,
        lastUpdatedAt: isoNow,
      };
    case 'periodic-increment':
      return {
        name: defaults.name, type: 'periodic-increment',
        currentValue: defaults.currentValue, maxValue: defaults.maxValue,
        incrementAmount: defaults.incrementAmount,
        scheduleTimes: defaults.scheduleTimes,
        lastUpdatedAt: isoNow,
      };
  }
}
