import type { PeriodicIncrementTimer, PeriodicIncrementState } from './types';
import { countScheduledEvents, findNextScheduledTime } from './schedule';

export function computePeriodicIncrement(
  timer: PeriodicIncrementTimer,
  now: Date,
): PeriodicIncrementState {
  const from = new Date(timer.lastUpdatedAt);
  const eventCount = countScheduledEvents(timer.scheduleTimes, from, now);
  const totalIncrement = eventCount * timer.incrementAmount;
  const currentValue = Math.min(
    timer.currentValue + totalIncrement,
    timer.maxValue,
  );
  const isAtMax = currentValue >= timer.maxValue;

  if (isAtMax) {
    return {
      type: 'periodic-increment',
      currentValue,
      maxValue: timer.maxValue,
      isAtMax: true,
      nextIncrementAt: null,
      timeToMaxMs: 0,
    };
  }

  const nextIncrementAt = findNextScheduledTime(timer.scheduleTimes, now);
  const timeToMaxMs = computeTimeToMax(
    now,
    currentValue,
    timer.maxValue,
    timer.incrementAmount,
    timer.scheduleTimes,
  );

  return {
    type: 'periodic-increment',
    currentValue,
    maxValue: timer.maxValue,
    isAtMax: false,
    nextIncrementAt,
    timeToMaxMs,
  };
}

function computeTimeToMax(
  now: Date,
  currentValue: number,
  maxValue: number,
  incrementAmount: number,
  scheduleTimes: string[],
): number {
  const remaining = maxValue - currentValue;
  const eventsNeeded = Math.ceil(remaining / incrementAmount);

  let cursor = new Date(now);
  for (let i = 0; i < eventsNeeded; i++) {
    cursor = findNextScheduledTime(scheduleTimes, cursor);
  }

  return cursor.getTime() - now.getTime();
}
