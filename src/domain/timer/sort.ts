import type { Timer } from './types';
import { getUrgencyLevel } from './urgency';

export type SortMode = 'priority' | 'urgency' | 'created-asc' | 'created-desc';

const SORT_MODE_WHITELIST: readonly string[] = ['priority', 'urgency', 'created-asc', 'created-desc'];

export function isValidSortMode(value: string): value is SortMode {
  return SORT_MODE_WHITELIST.includes(value);
}

const URGENCY_ORDER: Record<string, number> = {
  overdue: 0,
  today: 1,
  soon: 2,
  normal: 3,
};

export function compareTimers(a: Timer, b: Timer, mode: SortMode, now: Date): number {
  let primary: number;

  switch (mode) {
    case 'priority':
      primary = (a.priority ?? 4) - (b.priority ?? 4);
      break;
    case 'urgency': {
      const ua = URGENCY_ORDER[getUrgencyLevel(a, now)] ?? 3;
      const ub = URGENCY_ORDER[getUrgencyLevel(b, now)] ?? 3;
      primary = ua - ub;
      break;
    }
    case 'created-asc':
      primary = a.createdAt.localeCompare(b.createdAt);
      break;
    case 'created-desc':
      primary = b.createdAt.localeCompare(a.createdAt);
      break;
  }

  if (primary !== 0) return primary;

  // タイブレーク: priority ASC → createdAt DESC → id ASC
  const priDiff = (a.priority ?? 4) - (b.priority ?? 4);
  if (priDiff !== 0) return priDiff;

  const createdDiff = b.createdAt.localeCompare(a.createdAt);
  if (createdDiff !== 0) return createdDiff;

  return a.id.localeCompare(b.id);
}
