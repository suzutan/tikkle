import { computeTimerState } from '../domain/timer/compute';
import { formatDuration, formatFraction, formatDateTime, formatTime } from '../domain/timer/format';
import type { Timer } from '../domain/timer/types';

interface TimerDisplayData {
  display: string;
  subtext: string;
  targetTime: string;
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
    targetTime: '',
    percentage: -1,
    expired: false,

    init() {
      this.update();
      setInterval(() => this.update(), 1000);
    },

    update() {
      const state = computeTimerState(timer, new Date());
      const now = Date.now();

      switch (state.type) {
        case 'countdown':
          this.display = state.isExpired ? '期限切れ' : formatDuration(state.remainingMs);
          this.expired = state.isExpired;
          if (timer.type === 'countdown') {
            this.targetTime = `目標: ${formatDateTime(timer.targetDate)}`;
            // Calculate progress: assume countdown started 7 days before target
            const targetMs = new Date(timer.targetDate).getTime();
            const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
            const elapsed = totalDuration - state.remainingMs;
            this.percentage = state.isExpired ? 0 : Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
          }
          break;
        case 'elapsed':
          this.display = formatDuration(state.elapsedMs);
          if (timer.type === 'elapsed') {
            this.targetTime = `開始: ${formatDateTime(timer.startDate)}`;
            // For elapsed timers, show progress towards 24 hours
            const hoursElapsed = state.elapsedMs / (60 * 60 * 1000);
            this.percentage = Math.min(100, (hoursElapsed / 24) * 100);
          }
          break;
        case 'countdown-elapsed':
          this.display = formatDuration(state.ms);
          this.subtext = state.mode === 'countdown' ? '残り' : '超過';
          this.expired = state.mode === 'elapsed';
          if (timer.type === 'countdown-elapsed') {
            this.targetTime = `目標: ${formatDateTime(timer.targetDate)}`;
            const targetMs = new Date(timer.targetDate).getTime();
            if (state.mode === 'countdown') {
              // Countdown mode: show remaining time as progress
              const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
              const elapsed = totalDuration - state.ms;
              this.percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
            } else {
              // Elapsed mode: show how long it's been overdue
              this.percentage = 0;
            }
          }
          break;
        case 'stamina': {
          this.display = formatFraction(state.currentValue, state.maxValue);
          this.percentage = (state.currentValue / state.maxValue) * 100;
          this.subtext = state.isFull ? '' : `次の回復: ${formatDuration(state.nextRecoveryMs)}`;

          // 完全回復予定時刻を計算
          if (!state.isFull && state.timeToFullMs > 0) {
            const fullRecoveryDate = new Date(now + state.timeToFullMs);
            this.targetTime = `完全回復: ${formatTime(fullRecoveryDate.toISOString())}`;
          } else {
            this.targetTime = '完全回復済み';
          }
          break;
        }
        case 'periodic-increment': {
          this.display = formatFraction(state.currentValue, state.maxValue);
          this.percentage = (state.currentValue / state.maxValue) * 100;
          this.subtext = state.isAtMax ? '' : `全回復まで: ${formatDuration(state.timeToMaxMs)}`;

          // 次回増加時刻と上限到達予定時刻を表示
          if (state.nextIncrementAt) {
            this.targetTime = `次回: ${formatTime(state.nextIncrementAt.toISOString())}`;
          } else {
            this.targetTime = '上限到達';
          }
          break;
        }
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

// Dark mode management
interface DarkModeData {
  isDark: boolean;
  init(): void;
  toggle(): void;
  updateDOM(): void;
}

declare global {
  interface Window {
    darkMode: () => DarkModeData;
  }
}

window.darkMode = function (): DarkModeData {
  return {
    isDark: false,

    init() {
      // Load from localStorage or use system preference
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) {
        this.isDark = stored === 'true';
      } else {
        this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      this.updateDOM();
    },

    toggle() {
      this.isDark = !this.isDark;
      localStorage.setItem('darkMode', String(this.isDark));
      this.updateDOM();
    },

    updateDOM() {
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  };
};
