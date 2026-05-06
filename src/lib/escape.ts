/**
 * Alpine.js の属性に埋め込むユーザーデータのエスケープ。
 * hono/jsx が属性値の HTML エンコード（" → &quot;）を自動で行うため、
 * ここでは JS 文字列として壊れない変換のみ行う。
 */
export function escapeForAlpineAttr(value: string): string {
  return value
    .replace(/\\/g, '\\\\')       // バックスラッシュ
    .replace(/'/g, "\\'")          // シングルクォート
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
