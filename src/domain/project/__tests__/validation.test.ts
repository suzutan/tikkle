import { describe, test, expect } from 'vitest';
import { createProjectSchema, updateProjectSchema } from '../validation';

describe('createProjectSchema', () => {
  test('有効な入力を受け入れる', () => {
    // Given: 有効なプロジェクト名
    const input = { name: 'テストプロジェクト' };

    // When: バリデーション
    const result = createProjectSchema.safeParse(input);

    // Then: 成功する
    expect(result.success).toBe(true);
  });

  test('空文字列を拒否する', () => {
    // Given: 空のプロジェクト名
    const input = { name: '' };

    // When: バリデーション
    const result = createProjectSchema.safeParse(input);

    // Then: 失敗する
    expect(result.success).toBe(false);
  });

  test('name が未指定の場合に拒否する', () => {
    // Given: name がない入力
    const input = {};

    // When: バリデーション
    const result = createProjectSchema.safeParse(input);

    // Then: 失敗する
    expect(result.success).toBe(false);
  });

  test('name が文字列でない場合に拒否する', () => {
    // Given: name が数値
    const input = { name: 123 };

    // When: バリデーション
    const result = createProjectSchema.safeParse(input);

    // Then: 失敗する
    expect(result.success).toBe(false);
  });
});

describe('updateProjectSchema', () => {
  test('name のみの更新を受け入れる', () => {
    // Given: name のみの入力
    const input = { name: '更新後プロジェクト' };

    // When: バリデーション
    const result = updateProjectSchema.safeParse(input);

    // Then: 成功する
    expect(result.success).toBe(true);
  });

  test('sortOrder のみの更新を受け入れる', () => {
    // Given: sortOrder のみの入力
    const input = { sortOrder: 3 };

    // When: バリデーション
    const result = updateProjectSchema.safeParse(input);

    // Then: 成功する
    expect(result.success).toBe(true);
  });

  test('空オブジェクトを受け入れる', () => {
    // Given: 空のオブジェクト
    const input = {};

    // When: バリデーション
    const result = updateProjectSchema.safeParse(input);

    // Then: 成功する
    expect(result.success).toBe(true);
  });

  test('空文字列の name を拒否する', () => {
    // Given: 空の name
    const input = { name: '' };

    // When: バリデーション
    const result = updateProjectSchema.safeParse(input);

    // Then: 失敗する
    expect(result.success).toBe(false);
  });

  test('負の sortOrder を拒否する', () => {
    // Given: 負の sortOrder
    const input = { sortOrder: -1 };

    // When: バリデーション
    const result = updateProjectSchema.safeParse(input);

    // Then: 失敗する
    expect(result.success).toBe(false);
  });

  test('小数の sortOrder を拒否する', () => {
    // Given: 小数の sortOrder
    const input = { sortOrder: 1.5 };

    // When: バリデーション
    const result = updateProjectSchema.safeParse(input);

    // Then: 失敗する
    expect(result.success).toBe(false);
  });
});
