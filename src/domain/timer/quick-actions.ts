import type { Timer } from './types';

export type QuickAction =
  | { action: 'adjust-value'; delta: number }
  | { action: 'reset-value' }
  | { action: 'max-value' };

export interface QuickActionResult {
  currentValue?: number;
  lastUpdatedAt?: string;
}

/**
 * クイックアクションを適用した結果を計算する
 * 実際のDB更新は呼び出し元が行う
 */
export function applyQuickAction(
  timer: Timer,
  action: QuickAction,
  now: Date,
): QuickActionResult {
  if (timer.type !== 'stamina' && timer.type !== 'periodic-increment') {
    throw new Error(`Quick actions are only supported for stamina and periodic-increment timers`);
  }

  switch (action.action) {
    case 'adjust-value': {
      const newValue = Math.max(0, Math.min(timer.maxValue, timer.currentValue + action.delta));
      return { currentValue: newValue, lastUpdatedAt: now.toISOString() };
    }
    case 'reset-value':
      return { currentValue: 0, lastUpdatedAt: now.toISOString() };
    case 'max-value':
      return { currentValue: timer.maxValue, lastUpdatedAt: now.toISOString() };
  }
}
