/**
 * Alpine.js の x-data 属性に埋め込むユーザーデータのエスケープ。
 * シングルクォート囲みの属性値で安全に使える文字列を返す。
 */
export function escapeForAlpineAttr(value: string): string {
  return value
    .replace(/\\/g, '\\\\')       // バックスラッシュ
    .replace(/'/g, "\\'")          // シングルクォート
    .replace(/"/g, '&quot;')       // ダブルクォート
    .replace(/<\//g, '<\\/')       // </script> 等のタグ閉じ
    .replace(/\n/g, '\\n')         // 改行
    .replace(/\r/g, '\\r')         // キャリッジリターン
    .replace(/\u2028/g, '\\u2028') // Line Separator
    .replace(/\u2029/g, '\\u2029'); // Paragraph Separator
}

/**
 * オブジェクトを JSON.stringify してから Alpine 属性用にエスケープする。
 */
export function safeJsonForAlpine(obj: unknown): string {
  return escapeForAlpineAttr(JSON.stringify(obj));
}
