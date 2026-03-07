import type { Timer } from './types';
import type { TimerState } from './types';

export interface NotificationCheck {
  shouldNotify: boolean;
  title: string;
  body: string;
}

/**
 * タイマーの状態に基づいて通知すべきかを判定する
 * - countdown: 期限到達時
 * - countdown-elapsed: 期限到達時（countdown→elapsed切り替え時）
 * - stamina: 完全回復時
 * - periodic-increment: 上限到達時
 */
export function checkNotification(
  timer: Timer,
  state: TimerState,
  prevState: TimerState | null,
): NotificationCheck {
  const noNotification: NotificationCheck = { shouldNotify: false, title: '', body: '' };

  if (!prevState) return noNotification;

  switch (state.type) {
    case 'countdown':
      if (state.isExpired && prevState.type === 'countdown' && !prevState.isExpired) {
        return {
          shouldNotify: true,
          title: `${timer.name} - 期限到達`,
          body: 'カウントダウンが終了しました',
        };
      }
      return noNotification;

    case 'countdown-elapsed':
      if (
        state.mode === 'elapsed' &&
        prevState.type === 'countdown-elapsed' &&
        prevState.mode === 'countdown'
      ) {
        return {
          shouldNotify: true,
          title: `${timer.name} - 期限到達`,
          body: '目標時刻を過ぎました',
        };
      }
      return noNotification;

    case 'stamina':
      if (
        state.isFull &&
        prevState.type === 'stamina' &&
        !prevState.isFull
      ) {
        return {
          shouldNotify: true,
          title: `${timer.name} - 完全回復`,
          body: `スタミナが最大値 (${state.maxValue}) に到達しました`,
        };
      }
      return noNotification;

    case 'periodic-increment':
      if (
        state.isAtMax &&
        prevState.type === 'periodic-increment' &&
        !prevState.isAtMax
      ) {
        return {
          shouldNotify: true,
          title: `${timer.name} - 上限到達`,
          body: `値が最大値 (${state.maxValue}) に到達しました`,
        };
      }
      return noNotification;

    case 'elapsed':
      return noNotification;
  }
}
