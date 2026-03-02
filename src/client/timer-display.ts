import { computeTimerState } from '../domain/timer/compute';
import { formatDuration, formatFraction } from '../domain/timer/format';
import type { Timer } from '../domain/timer/types';

interface TimerDisplayData {
  display: string;
  subtext: string;
  percentage: number;
  expired: boolean;
  init(): void;
  update(): void;
}

interface TimerFormData {
  type: string;
  isEdit: boolean;
  onTypeChange(): void;
}

declare global {
  interface Window {
    timerDisplay: (json: string) => TimerDisplayData;
    timerForm: (opts: { type: string; isEdit: boolean }) => TimerFormData;
  }
}

window.timerDisplay = function (json: string): TimerDisplayData {
  const timer: Timer = JSON.parse(json);

  return {
    display: '',
    subtext: '',
    percentage: -1,
    expired: false,

    init() {
      this.update();
      setInterval(() => this.update(), 1000);
    },

    update() {
      const state = computeTimerState(timer, new Date());
      switch (state.type) {
        case 'countdown':
          this.display = state.isExpired ? '期限切れ' : formatDuration(state.remainingMs);
          this.expired = state.isExpired;
          break;
        case 'elapsed':
          this.display = formatDuration(state.elapsedMs);
          break;
        case 'countdown-elapsed':
          this.display = formatDuration(state.ms);
          this.subtext = state.mode === 'countdown' ? '残り' : '超過';
          break;
        case 'stamina':
          this.display = formatFraction(state.currentValue, state.maxValue);
          this.percentage = (state.currentValue / state.maxValue) * 100;
          this.subtext = state.isFull ? '' : `次の回復: ${formatDuration(state.nextRecoveryMs)}`;
          break;
        case 'periodic-increment':
          this.display = formatFraction(state.currentValue, state.maxValue);
          this.percentage = (state.currentValue / state.maxValue) * 100;
          this.subtext = state.isAtMax ? '' : `全回復まで: ${formatDuration(state.timeToMaxMs)}`;
          break;
      }
    },
  };
};

window.timerForm = function (opts: { type: string; isEdit: boolean }): TimerFormData {
  return {
    type: opts.type,
    isEdit: opts.isEdit,
    onTypeChange() {},
  };
};
