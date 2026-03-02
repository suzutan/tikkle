import type { StaminaTimer, StaminaState } from './types';

export function computeStamina(
  timer: StaminaTimer,
  now: Date,
): StaminaState {
  const elapsedMs = now.getTime() - new Date(timer.lastUpdatedAt).getTime();
  // Use recoveryIntervalSeconds if available, otherwise fall back to recoveryIntervalMinutes
  const intervalSeconds = timer.recoveryIntervalSeconds ?? (timer.recoveryIntervalMinutes * 60);
  const intervalMs = intervalSeconds * 1000;

  const recoveries = Math.floor(elapsedMs / intervalMs);
  const currentValue = Math.min(
    timer.currentValue + recoveries,
    timer.maxValue,
  );
  const isFull = currentValue >= timer.maxValue;

  if (isFull) {
    return {
      type: 'stamina',
      currentValue,
      maxValue: timer.maxValue,
      isFull: true,
      nextRecoveryMs: 0,
      timeToFullMs: 0,
    };
  }

  const elapsedInCurrentInterval = elapsedMs % intervalMs;
  const nextRecoveryMs = intervalMs - elapsedInCurrentInterval;
  const remaining = timer.maxValue - currentValue;
  const timeToFullMs = nextRecoveryMs + (remaining - 1) * intervalMs;

  return {
    type: 'stamina',
    currentValue,
    maxValue: timer.maxValue,
    isFull: false,
    nextRecoveryMs,
    timeToFullMs,
  };
}
