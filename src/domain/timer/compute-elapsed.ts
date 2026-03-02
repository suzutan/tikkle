import type { ElapsedTimer, ElapsedState } from './types';

export function computeElapsed(
  timer: ElapsedTimer,
  now: Date,
): ElapsedState {
  const startMs = new Date(timer.startDate).getTime();
  const diff = now.getTime() - startMs;

  return {
    type: 'elapsed',
    elapsedMs: Math.max(0, diff),
  };
}
