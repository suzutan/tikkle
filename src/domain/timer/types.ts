interface TimerBase {
  id: string;
  name: string;
  tags?: string[]; // Optional array of tag strings
  createdAt: string;
  updatedAt: string;
  archivedAt?: string; // ISO datetime when archived, undefined if active
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
  recoveryIntervalMinutes: number; // Deprecated: use recoveryIntervalSeconds
  recoveryIntervalSeconds?: number; // Preferred: recovery interval in seconds
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
  | { name: string; type: 'countdown'; targetDate: string; tags?: string[] }
  | { name: string; type: 'elapsed'; startDate: string; tags?: string[] }
  | { name: string; type: 'countdown-elapsed'; targetDate: string; tags?: string[] }
  | {
      name: string;
      type: 'stamina';
      currentValue: number;
      maxValue: number;
      recoveryIntervalMinutes: number;
      recoveryIntervalSeconds?: number;
      lastUpdatedAt: string;
      tags?: string[];
    }
  | {
      name: string;
      type: 'periodic-increment';
      currentValue: number;
      maxValue: number;
      incrementAmount: number;
      scheduleTimes: string[];
      lastUpdatedAt: string;
      tags?: string[];
    };

export type UpdateTimerInput =
  | { type: 'countdown'; name?: string; targetDate?: string; tags?: string[] }
  | { type: 'elapsed'; name?: string; startDate?: string; tags?: string[] }
  | { type: 'countdown-elapsed'; name?: string; targetDate?: string; tags?: string[] }
  | {
      type: 'stamina';
      name?: string;
      currentValue?: number;
      maxValue?: number;
      recoveryIntervalMinutes?: number;
      recoveryIntervalSeconds?: number;
      lastUpdatedAt?: string;
      tags?: string[];
    }
  | {
      type: 'periodic-increment';
      name?: string;
      currentValue?: number;
      maxValue?: number;
      incrementAmount?: number;
      scheduleTimes?: string[];
      lastUpdatedAt?: string;
      tags?: string[];
    };
