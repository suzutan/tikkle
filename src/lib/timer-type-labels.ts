import type { Timer } from '@/domain/timer/types';

export const TIMER_TYPE_LABELS: Record<Timer['type'], string> = {
  'countdown': 'カウントダウン',
  'elapsed': '経過時間',
  'countdown-elapsed': 'カウントダウン＋経過',
  'stamina': 'スタミナ',
  'periodic-increment': '定期増加',
};
