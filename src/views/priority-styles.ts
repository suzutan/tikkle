import type { PriorityLevel } from '../domain/timer/priority';

export const PRIORITY_COLORS: Record<PriorityLevel, { badge: string; text: string }> = {
  1: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    text: 'text-red-600 dark:text-red-400',
  },
  2: {
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    text: 'text-orange-600 dark:text-orange-400',
  },
  3: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    text: 'text-blue-600 dark:text-blue-400',
  },
  4: {
    badge: '',
    text: 'text-gray-400 dark:text-gray-500',
  },
};
