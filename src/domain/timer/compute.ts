import type { Timer, TimerState } from './types';
import { computeCountdown } from './compute-countdown';
import { computeElapsed } from './compute-elapsed';
import { computeCountdownElapsed } from './compute-countdown-elapsed';
import { computeStamina } from './compute-stamina';
import { computePeriodicIncrement } from './compute-periodic-increment';

export function computeTimerState(timer: Timer, now: Date): TimerState {
  switch (timer.type) {
    case 'countdown':
      return computeCountdown(timer, now);
    case 'elapsed':
      return computeElapsed(timer, now);
    case 'countdown-elapsed':
      return computeCountdownElapsed(timer, now);
    case 'stamina':
      return computeStamina(timer, now);
    case 'periodic-increment':
      return computePeriodicIncrement(timer, now);
  }
}
