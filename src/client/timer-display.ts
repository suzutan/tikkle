import { computeTimerState } from '../domain/timer/compute';
import { formatDuration, formatFraction, formatDateTime } from '../domain/timer/format';
import { checkNotification } from '../domain/timer/notification';
import type { Timer, TimerState } from '../domain/timer/types';

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
    readFilterFromUrl: (key: string) => string[];
    syncFilterToUrl: (key: string, values: string[]) => void;
  }
}

window.timerDisplay = function (json: string): TimerDisplayData {
  const timer: Timer = JSON.parse(json);
  let prevState: TimerState | null = null;

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

      // Check for notification trigger
      if (prevState && window.Notification && Notification.permission === 'granted') {
        const check = checkNotification(timer, state, prevState);
        if (check.shouldNotify) {
          new Notification(check.title, { body: check.body });
        }
      }
      prevState = state;

      switch (state.type) {
        case 'countdown':
          this.display = state.isExpired ? '期限切れ' : formatDuration(state.remainingMs);
          this.expired = state.isExpired;
          if (timer.type === 'countdown') {
            this.targetTime = `目標: ${formatDateTime(timer.targetDate)}`;
            // Calculate progress: use actual countdown period from creation to target
            const targetMs = new Date(timer.targetDate).getTime();
            const createdMs = new Date(timer.createdAt).getTime();
            const totalDuration = targetMs - createdMs;
            const elapsed = now - createdMs;
            // Progress shows how much time has passed relative to total duration
            this.percentage = state.isExpired ? 100 : Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
          }
          break;
        case 'elapsed':
          if (state.pendingMs > 0) {
            this.display = formatDuration(state.pendingMs);
            this.subtext = '開始まで';
            this.percentage = 0;
          } else {
            this.display = formatDuration(state.elapsedMs);
            // For elapsed timers, show progress towards 24 hours
            const hoursElapsed = state.elapsedMs / (60 * 60 * 1000);
            this.percentage = Math.min(100, (hoursElapsed / 24) * 100);
          }
          if (timer.type === 'elapsed') {
            this.targetTime = `開始: ${formatDateTime(timer.startDate)}`;
          }
          break;
        case 'countdown-elapsed':
          this.display = formatDuration(state.ms);
          this.subtext = state.mode === 'countdown' ? '残り' : '超過';
          this.expired = state.mode === 'elapsed';
          if (timer.type === 'countdown-elapsed') {
            this.targetTime = `目標: ${formatDateTime(timer.targetDate)}`;
            const targetMs = new Date(timer.targetDate).getTime();
            const createdMs = new Date(timer.createdAt).getTime();
            if (state.mode === 'countdown') {
              // Countdown mode: show progress from creation to target
              const totalDuration = targetMs - createdMs;
              const elapsed = now - createdMs;
              this.percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
            } else {
              // Elapsed mode: show 100% when overdue
              this.percentage = 100;
            }
          }
          break;
        case 'stamina': {
          this.display = formatFraction(state.currentValue, state.maxValue);
          this.percentage = (state.currentValue / state.maxValue) * 100;
          this.subtext = state.isFull ? '' : `次の回復まで: ${formatDuration(state.nextRecoveryMs)}`;

          // 完全回復予定時刻と残り時間を表示
          if (!state.isFull && state.timeToFullMs > 0) {
            const fullRecoveryDate = new Date(now + state.timeToFullMs);
            this.targetTime = `完全回復: ${formatDateTime(fullRecoveryDate.toISOString())}\n(${formatDuration(state.timeToFullMs)}後)`;
          } else {
            this.targetTime = '完全回復済み';
          }
          break;
        }
        case 'periodic-increment': {
          this.display = formatFraction(state.currentValue, state.maxValue);
          this.percentage = (state.currentValue / state.maxValue) * 100;

          // 次回増加までのカウントダウンと完全回復予定を表示
          if (state.isAtMax || !state.nextIncrementAt) {
            this.subtext = '';
            this.targetTime = '上限到達';
          } else {
            const nextMs = state.nextIncrementAt.getTime() - now;
            this.subtext = `次回増加まで: ${formatDuration(Math.max(0, nextMs))}`;
            const maxDate = new Date(now + state.timeToMaxMs);
            this.targetTime = `完全回復: ${formatDateTime(maxDate.toISOString())}\n(${formatDuration(state.timeToMaxMs)}後)`;
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

// URL filter sync helpers
window.readFilterFromUrl = function (key: string): string[] {
  const val = new URLSearchParams(window.location.search).get(key);
  return val ? val.split(',').filter(Boolean) : [];
};

window.syncFilterToUrl = function (key: string, values: string[]): void {
  const params = new URLSearchParams(window.location.search);
  if (values.length > 0) {
    params.set(key, values.join(','));
  } else {
    params.delete(key);
  }
  const qs = params.toString();
  history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
};

// Dark mode management
interface DarkModeData {
  isDark: boolean;
  init(): void;
  setMode(dark: boolean): void;
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

    setMode(dark: boolean) {
      this.isDark = dark;
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

// Notification toggle
interface NotificationToggleData {
  isSupported: boolean;
  isEnabled: boolean;
  init(): void;
  toggle(): void;
}

declare global {
  interface Window {
    notificationToggle: () => NotificationToggleData;
  }
}

window.notificationToggle = function (): NotificationToggleData {
  return {
    isSupported: false,
    isEnabled: false,

    init() {
      this.isSupported = 'Notification' in window;
      this.isEnabled = this.isSupported && Notification.permission === 'granted';
    },

    async toggle() {
      if (!this.isSupported) return;

      if (Notification.permission === 'granted') {
        // Already granted - no browser API to revoke, just inform user
        this.isEnabled = true;
        return;
      }

      if (Notification.permission === 'denied') {
        // Denied - can't request again
        return;
      }

      // Request permission
      const result = await Notification.requestPermission();
      this.isEnabled = result === 'granted';
    },
  };
};
