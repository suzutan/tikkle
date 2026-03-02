import type { CountdownTimer, CountdownState } from './types';

export function computeCountdown(
  timer: CountdownTimer,
  now: Date,
): CountdownState {
  const targetMs = new Date(timer.targetDate).getTime();
  const diff = targetMs - now.getTime();
  const isExpired = diff <= 0;

  return {
    type: 'countdown',
    remainingMs: isExpired ? 0 : diff,
    isExpired,
  };
}
