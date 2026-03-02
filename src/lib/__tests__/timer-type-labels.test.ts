import { describe, test, expect } from 'vitest';
import { TIMER_TYPE_LABELS } from '../timer-type-labels';

describe('TIMER_TYPE_LABELS', () => {
  test('全てのタイマー種別のラベルが定義されている', () => {
    // Given/When: TIMER_TYPE_LABELS を参照
    const labels = TIMER_TYPE_LABELS;

    // Then: 全ての種別のラベルが存在する
    expect(labels['countdown']).toBe('カウントダウン');
    expect(labels['elapsed']).toBe('経過時間');
    expect(labels['countdown-elapsed']).toBe('カウントダウン＋経過');
    expect(labels['stamina']).toBe('スタミナ');
    expect(labels['periodic-increment']).toBe('定期増加');
  });

  test('オブジェクトのキーが5つ存在する', () => {
    // Given/When: TIMER_TYPE_LABELS を参照
    const keys = Object.keys(TIMER_TYPE_LABELS);

    // Then: 5つのキーが存在する
    expect(keys).toHaveLength(5);
  });
});
