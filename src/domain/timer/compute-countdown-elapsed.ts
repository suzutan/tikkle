import type { CountdownElapsedTimer, CountdownElapsedState } from './types';

export function computeCountdownElapsed(
  timer: CountdownElapsedTimer,
  now: Date,
): CountdownElapsedState {
  const targetMs = new Date(timer.targetDate).getTime();
  const nowMs = now.getTime();
  const diff = targetMs - nowMs;

  if (diff > 0) {
    return {
      type: 'countdown-elapsed',
      mode: 'countdown',
      ms: diff,
    };
  }

  return {
    type: 'countdown-elapsed',
    mode: 'elapsed',
    ms: Math.abs(diff),
  };
}
