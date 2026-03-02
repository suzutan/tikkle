interface TimerBase {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CountdownTimer extends TimerBase {
  type: 'countdown';
  targetDate: string;
}

export interface ElapsedTimer extends TimerBase {
  type: 'elapsed';
  startDate: string;
}

export interface CountdownElapsedTimer extends TimerBase {
  type: 'countdown-elapsed';
  targetDate: string;
}

export interface StaminaTimer extends TimerBase {
  type: 'stamina';
  currentValue: number;
  maxValue: number;
  recoveryIntervalMinutes: number;
  lastUpdatedAt: string;
}

export interface PeriodicIncrementTimer extends TimerBase {
  type: 'periodic-increment';
  currentValue: number;
  maxValue: number;
  incrementAmount: number;
  scheduleTimes: string[];
  lastUpdatedAt: string;
}

export type Timer =
  | CountdownTimer
  | ElapsedTimer
  | CountdownElapsedTimer
  | StaminaTimer
  | PeriodicIncrementTimer;

export interface CountdownState {
  type: 'countdown';
  remainingMs: number;
  isExpired: boolean;
}

export interface ElapsedState {
  type: 'elapsed';
  elapsedMs: number;
}

export interface CountdownElapsedState {
  type: 'countdown-elapsed';
  mode: 'countdown' | 'elapsed';
  ms: number;
}

export interface StaminaState {
  type: 'stamina';
  currentValue: number;
  maxValue: number;
  isFull: boolean;
  nextRecoveryMs: number;
  timeToFullMs: number;
}

export interface PeriodicIncrementState {
  type: 'periodic-increment';
  currentValue: number;
  maxValue: number;
  isAtMax: boolean;
  nextIncrementAt: Date | null;
  timeToMaxMs: number;
}

export type TimerState =
  | CountdownState
  | ElapsedState
  | CountdownElapsedState
  | StaminaState
  | PeriodicIncrementState;

export type CreateTimerInput =
  | { name: string; type: 'countdown'; targetDate: string }
  | { name: string; type: 'elapsed'; startDate: string }
  | { name: string; type: 'countdown-elapsed'; targetDate: string }
  | {
      name: string;
      type: 'stamina';
      currentValue: number;
      maxValue: number;
      recoveryIntervalMinutes: number;
      lastUpdatedAt: string;
    }
  | {
      name: string;
      type: 'periodic-increment';
      currentValue: number;
      maxValue: number;
      incrementAmount: number;
      scheduleTimes: string[];
      lastUpdatedAt: string;
    };

export type UpdateTimerInput =
  | { type: 'countdown'; name?: string; targetDate?: string }
  | { type: 'elapsed'; name?: string; startDate?: string }
  | { type: 'countdown-elapsed'; name?: string; targetDate?: string }
  | {
      type: 'stamina';
      name?: string;
      currentValue?: number;
      maxValue?: number;
      recoveryIntervalMinutes?: number;
      lastUpdatedAt?: string;
    }
  | {
      type: 'periodic-increment';
      name?: string;
      currentValue?: number;
      maxValue?: number;
      incrementAmount?: number;
      scheduleTimes?: string[];
      lastUpdatedAt?: string;
    };
