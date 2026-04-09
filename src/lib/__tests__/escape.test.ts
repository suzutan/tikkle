import { describe, test, expect } from 'vitest';
import { escapeForAlpineAttr, safeJsonForAlpine } from '../escape';

describe('escapeForAlpineAttr', () => {
  test('シングルクォートをエスケープする', () => {
    // Given
    const input = "it's a test";

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe("it\\'s a test");
  });

  test('ダブルクォートはそのまま保持する（hono/jsx が HTML エンコードを行う）', () => {
    // Given
    const input = 'say "hello"';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('say "hello"');
  });

  test('バックスラッシュをエスケープする', () => {
    // Given
    const input = 'path\\to\\file';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('path\\\\to\\\\file');
  });

  test('</script> タグをエスケープする', () => {
    // Given
    const input = '</script><script>alert(1)</script>';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('<\\/script><script>alert(1)<\\/script>');
    expect(result).not.toContain('</');
  });

  test('改行をエスケープする', () => {
    // Given
    const input = 'line1\nline2';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('line1\\nline2');
  });

  test('キャリッジリターンをエスケープする', () => {
    // Given
    const input = 'line1\rline2';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('line1\\rline2');
  });

  test('Line Separator (U+2028) をエスケープする', () => {
    // Given
    const input = 'before\u2028after';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('before\\u2028after');
  });

  test('Paragraph Separator (U+2029) をエスケープする', () => {
    // Given
    const input = 'before\u2029after';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('before\\u2029after');
  });

  test('空文字列をそのまま返す', () => {
    // Given
    const input = '';

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe('');
  });

  test('複数の特殊文字を同時にエスケープする', () => {
    // Given
    const input = "it's a </script>\ntest";

    // When
    const result = escapeForAlpineAttr(input);

    // Then
    expect(result).toBe("it\\'s a <\\/script>\\ntest");
  });
});

describe('safeJsonForAlpine', () => {
  test('ネストオブジェクトを安全にシリアライズする', () => {
    // Given
    const obj = { name: "it's <b>bold</b>", tags: ['a', 'b'] };

    // When
    const result = safeJsonForAlpine(obj);

    // Then - シングルクォートはエスケープされ、生のクォートは含まない
    expect(result).toContain("\\'");
    expect(result).not.toMatch(/(?<!\\)'/); // エスケープされていない生の ' がないこと
    expect(result).toContain('it');
    expect(result).toContain('bold');
  });

  test('</script> を含むオブジェクトを安全にシリアライズする', () => {
    // Given
    const obj = { content: '</script>' };

    // When
    const result = safeJsonForAlpine(obj);

    // Then
    expect(result).not.toContain('</');
  });

  test('プリミティブ値を安全にシリアライズする', () => {
    // Given/When/Then
    expect(safeJsonForAlpine(42)).toBe('42');
    expect(safeJsonForAlpine(null)).toBe('null');
    expect(safeJsonForAlpine(true)).toBe('true');
  });
});
