import { describe, test, expect } from 'vitest';
import { calculateRank, needsRebalance } from '../rank';

describe('calculateRank', () => {
  test('両方 null の場合は 1.0 を返す', () => {
    // Given/When
    const result = calculateRank(null, null);

    // Then
    expect(result).toBe(1.0);
  });

  test('before のみの場合は before + 1.0 を返す', () => {
    // Given/When
    const result = calculateRank(3.0, null);

    // Then
    expect(result).toBe(4.0);
  });

  test('after のみの場合は after / 2 を返す', () => {
    // Given/When
    const result = calculateRank(null, 4.0);

    // Then
    expect(result).toBe(2.0);
  });

  test('両方ある場合は中間値を返す', () => {
    // Given/When
    const result = calculateRank(2.0, 4.0);

    // Then
    expect(result).toBe(3.0);
  });

  test('隣接する整数の中間値を正しく計算する', () => {
    // Given/When
    const result = calculateRank(1.0, 2.0);

    // Then
    expect(result).toBe(1.5);
  });

  test('小数同士の中間値を計算する', () => {
    // Given/When
    const result = calculateRank(1.5, 1.75);

    // Then
    expect(result).toBe(1.625);
  });
});

describe('needsRebalance', () => {
  test('十分な差がある場合は false を返す', () => {
    // Given/When
    const result = needsRebalance(1.0, 2.0);

    // Then
    expect(result).toBe(false);
  });

  test('差が閾値未満の場合は true を返す', () => {
    // Given/When
    const result = needsRebalance(1.0, 1.0 + 1e-11);

    // Then
    expect(result).toBe(true);
  });

  test('同じ値の場合は true を返す', () => {
    // Given/When
    const result = needsRebalance(1.0, 1.0);

    // Then
    expect(result).toBe(true);
  });
});
