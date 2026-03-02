const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** datetime-local の値を JST として解釈し UTC ISO 文字列に変換 */
export function datetimeLocalToISO(value: string): string {
  return new Date(value + '+09:00').toISOString();
}

/** UTC ISO 文字列を JST の datetime-local 値 (YYYY-MM-DDTHH:MM) に変換 */
export function isoToDatetimeLocal(iso: string): string {
  const jst = new Date(new Date(iso).getTime() + JST_OFFSET_MS);
  return jst.toISOString().slice(0, 16);
}
