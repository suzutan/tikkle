import type { Timer } from './types';

export type UrgencyLevel = 'overdue' | 'today' | 'soon' | 'normal';

/**
 * タイマーの緊急度を判定する
 * - overdue: 期限超過
 * - today: 今日中が期限
 * - soon: 3日以内が期限
 * - normal: それ以外
 */
export function getUrgencyLevel(timer: Timer, now: Date): UrgencyLevel {
  const nowMs = now.getTime();
  // Use UTC-based date boundaries for consistency with server (Cloudflare Workers)
  const todayEnd = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999
  ));
  const soonEnd = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3, 23, 59, 59, 999
  ));

  switch (timer.type) {
    case 'countdown':
    case 'countdown-elapsed': {
      const targetMs = new Date(timer.targetDate).getTime();
      if (targetMs < nowMs) return 'overdue';
      if (targetMs <= todayEnd.getTime()) return 'today';
      if (targetMs <= soonEnd.getTime()) return 'soon';
      return 'normal';
    }
    case 'elapsed':
      // 経過タイマーには期限がないため常に normal
      return 'normal';
    case 'stamina':
    case 'periodic-increment':
      // 値系タイマーは満タンなら normal、それ以外は消費度に応じて判定
      if (timer.currentValue >= timer.maxValue) return 'normal';
      if (timer.currentValue === 0) return 'overdue';
      if (timer.currentValue / timer.maxValue <= 0.2) return 'today';
      if (timer.currentValue / timer.maxValue <= 0.5) return 'soon';
      return 'normal';
  }
}

const URGENCY_ORDER: Record<UrgencyLevel, number> = {
  overdue: 0,
  today: 1,
  soon: 2,
  normal: 3,
};

/**
 * タイマーを緊急度順にソートするための比較関数
 */
export function compareByUrgency(a: Timer, b: Timer, now: Date): number {
  const urgencyA = getUrgencyLevel(a, now);
  const urgencyB = getUrgencyLevel(b, now);
  return URGENCY_ORDER[urgencyA] - URGENCY_ORDER[urgencyB];
}
