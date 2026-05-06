export type PriorityLevel = 1 | 2 | 3 | 4;

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  1: '緊急',
  2: '高',
  3: '中',
  4: 'なし',
};

export function isPriorityLevel(n: number): n is PriorityLevel {
  return Number.isInteger(n) && n >= 1 && n <= 4;
}
