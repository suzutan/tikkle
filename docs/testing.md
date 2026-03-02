# テスト戦略

## テストピラミッド

```
           ┌─────────┐
           │  E2E    │  ← 未実装（予定）
           │ Tests   │
           └─────────┘
         ┌─────────────┐
         │ Integration │  ← 最小限（Repository）
         │   Tests     │
         └─────────────┘
     ┌───────────────────┐
     │   Unit Tests      │  ← 主力（ドメインロジック）
     │  (Domain, Lib)    │
     └───────────────────┘
```

---

## カバレッジ目標

### 全体目標: 85% 以上

**現在のカバレッジ（2026-03-03）:**
- **Lines**: 93.73% ✅
- **Statements**: 93.73% ✅
- **Branches**: 98.98% ✅
- **Functions**: 96.96% ✅

**カバレッジ設定（vitest.config.ts）:**
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'json-summary'],
  include: ['src/**/*.ts', 'src/**/*.tsx'],
  exclude: [
    'src/**/__tests__/**',
    'src/**/*.test.ts',
    'src/global.d.ts',
    'src/client/**',      // E2E でテスト
    'src/views/**',       // E2E でテスト
    'src/renderer.tsx',   // E2E でテスト
    'src/index.tsx',      // E2E でテスト
    'src/db/schema.ts',   // 型定義のみ
  ],
  thresholds: {
    lines: 85,
    functions: 85,
    branches: 85,
    statements: 85,
  },
}
```

---

## レイヤー別テスト戦略

### 1. Domain Layer (ドメインロジック)

**目標カバレッジ: 100%**

**テスト対象:**
- `src/domain/timer/compute-*.ts`: 計算ロジック
- `src/domain/timer/validation.ts`: バリデーション
- `src/domain/timer/format.ts`: フォーマット関数
- `src/domain/timer/schedule.ts`: スケジュール計算

**テストアプローチ:**
- Given-When-Then 形式でテストを構造化
- 境界値テスト（0, 最大値, 負の値など）
- エッジケーステスト（期限切れ、最大値到達など）

**テスト例:**
```typescript
describe('computeCountdown', () => {
  test('期限前の残り時間を正しく計算できる', () => {
    // Given: 2026-01-01 に作成、2026-12-31 が期限のタイマー
    const timer: CountdownTimer = {
      id: 'test-1',
      name: 'Test Timer',
      type: 'countdown',
      targetDate: '2026-12-31T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const now = new Date('2026-06-01T00:00:00.000Z');

    // When: computeCountdown を呼ぶ
    const state = computeCountdown(timer, now);

    // Then: 残り約213日が返される
    expect(state.isExpired).toBe(false);
    expect(state.remainingMs).toBeCloseTo(213 * 24 * 60 * 60 * 1000, -6);
  });
});
```

**現在のカバレッジ:**
- Lines: 100% ✅
- Functions: 100% ✅
- Branches: 100% ✅
- Statements: 100% ✅

---

### 2. Library Layer (ユーティリティ)

**目標カバレッジ: 100%**

**テスト対象:**
- `src/lib/timezone.ts`: タイムゾーン変換
- `src/lib/timer-form-helpers.ts`: フォームヘルパー
- `src/lib/timer-templates.ts`: テンプレート生成
- `src/lib/timer-type-labels.ts`: ラベル定義

**テストアプローチ:**
- 変換関数の正確性テスト
- 境界値テスト
- エッジケーステスト

**テスト例:**
```typescript
describe('datetimeLocalToISO', () => {
  test('JST の datetime-local 文字列を UTC の ISO 文字列に変換できる', () => {
    // Given: JST の 2026-12-31 23:59
    const jstDatetime = '2026-12-31T23:59';

    // When: datetimeLocalToISO を呼ぶ
    const iso = datetimeLocalToISO(jstDatetime);

    // Then: UTC の 2026-12-31 14:59 に変換される（-9時間）
    expect(iso).toBe('2026-12-31T14:59:00.000Z');
  });
});
```

**現在のカバレッジ:**
- Lines: 100% ✅
- Functions: 100% ✅
- Branches: 100% ✅
- Statements: 100% ✅

---

### 3. Repository Layer (データアクセス)

**目標カバレッジ: 60-80%**

**テスト対象:**
- `src/repository/timer.ts`: 変換関数 (`toTimer`, `toInsertValues`)

**テストアプローチ:**
- 変換関数は 100% カバレッジ
- D1TimerRepository のメソッドはモックテスト（基本動作のみ）

**テスト例:**
```typescript
describe('toTimer', () => {
  test('countdown timer を正しく変換できる', () => {
    // Given: countdown timer row
    const row = {
      id: 'timer-1',
      name: 'Test Countdown',
      type: 'countdown' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: '["work","important"]',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      // ...
    };

    // When: toTimer を呼ぶ
    const timer = toTimer(row);

    // Then: countdown timer が返される
    expect(timer.type).toBe('countdown');
    expect(timer.tags).toEqual(['work', 'important']);
  });
});
```

**現在のカバレッジ:**
- Lines: 72.14%
- Functions: 88.88%
- Branches: 96.29%
- Statements: 72.14%

**未カバー部分:**
- D1TimerRepository の update メソッドの一部（複雑な条件分岐）

---

### 4. Presentation Layer (ビュー・ルーティング)

**目標カバレッジ: E2E テストでカバー**

**除外理由:**
- SSR コンポーネントは統合テストが適切
- ルーティングロジックは統合テストが適切
- ユニットテストよりも E2E テストの方が効果的

**テスト対象:**
- `src/views/timer-card.tsx`
- `src/views/timer-form.tsx`
- `src/renderer.tsx`
- `src/index.tsx`

**E2E テスト予定内容:**
- タイマー一覧表示
- タイマー作成フロー
- タイマー編集フロー
- タイマー削除フロー
- ビュー切り替え
- フィルター機能
- ダークモード切り替え

---

### 5. Client-side Logic (Alpine.js)

**目標カバレッジ: E2E テストでカバー**

**除外理由:**
- Alpine.js のリアクティブロジックは統合テストが適切
- ブラウザ環境が必要

**テスト対象:**
- `src/client/timer-display.ts`
- `src/client/timer-form.ts`
- `src/client/dark-mode.ts`

**E2E テスト予定内容:**
- タイマーのリアルタイム更新
- フォームの動的制御
- ダークモード切り替えの動作

---

## テストツール

### Vitest

**バージョン:** 3.2.4

**設定:**
- グローバル変数有効化 (`globals: true`)
- Node 環境 (`environment: 'node'`)
- テストファイルパターン: `src/**/__tests__/**/*.test.ts`

**コマンド:**
- `npm test`: テスト実行
- `npm run test:watch`: ウォッチモード
- `npm run test:coverage`: カバレッジレポート生成

---

### @vitest/coverage-v8

**バージョン:** 3.2.4

**レポーター:**
- `text`: ターミナル出力
- `html`: ブラウザで閲覧可能な HTML レポート
- `json-summary`: CI/CD 用 JSON サマリー

**HTML レポート:**
- `coverage/index.html` で閲覧可能
- ファイルごとのカバレッジ詳細
- 未カバー行のハイライト

---

### Playwright (予定)

**用途:** E2E テスト

**テスト内容:**
- ユーザーフロー全体のテスト
- ブラウザ操作のテスト
- クロスブラウザテスト（Chrome, Firefox, Safari）

**導入予定時期:** Phase 4

---

## テスト実行

### ローカル開発

```bash
# 全テスト実行
npm test

# ウォッチモード（変更を検知して自動実行）
npm run test:watch

# カバレッジレポート生成
npm run test:coverage

# 型チェック
npm run typecheck
```

### CI/CD（GitHub Actions）

**トリガー:**
- プルリクエスト作成・更新時
- main ブランチへのプッシュ時

**実行内容:**
1. TypeScript 型チェック (`npm run typecheck`)
2. テスト実行 (`npm test`)
3. カバレッジチェック（85% 未満でエラー）
4. ビルド (`npm run build`)

**成功条件:**
- 全テストが pass
- カバレッジが 85% 以上
- TypeScript エラーなし
- ビルドエラーなし

---

## テストの書き方ガイドライン

### 1. Given-When-Then 形式

```typescript
test('テストケース名', () => {
  // Given: テスト前提条件を設定
  const input = { /* ... */ };

  // When: テスト対象の関数を実行
  const result = functionUnderTest(input);

  // Then: 期待される結果を検証
  expect(result).toEqual(expectedOutput);
});
```

### 2. テスト名の命名規則

- 日本語で具体的に記述
- 「〜できる」「〜を返す」「〜の場合は〜する」形式
- 例:
  - ✅ 「期限前の残り時間を正しく計算できる」
  - ✅ 「期限切れの場合は isExpired が true を返す」
  - ❌ 「正常系テスト」
  - ❌ 「test1」

### 3. テストの独立性

- 各テストは独立して実行可能であること
- テスト間で状態を共有しない
- 必要に応じて `beforeEach` でセットアップ

### 4. アサーションの明確性

- 期待値を明確に記述
- エラーメッセージから原因を特定できるようにする
- 複数のアサーションは避け、1テスト1検証を心がける

### 5. 境界値テスト

- 0, 最大値, 最小値をテスト
- エッジケース（期限切れ、最大値到達など）をテスト

---

## カバレッジレポートの見方

### ターミナル出力

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   93.73 |    98.98 |   96.96 |   93.73 |
 domain/timer      |     100 |      100 |     100 |     100 |
 lib               |     100 |      100 |     100 |     100 |
 repository        |   72.14 |    96.29 |   88.88 |   72.14 | 65,112-153
-------------------|---------|----------|---------|---------|-------------------
```

**カラム説明:**
- **% Stmts**: ステートメントカバレッジ
- **% Branch**: 分岐カバレッジ
- **% Funcs**: 関数カバレッジ
- **% Lines**: 行カバレッジ
- **Uncovered Line #s**: 未カバー行番号

### HTML レポート

1. `npm run test:coverage` を実行
2. `coverage/index.html` をブラウザで開く
3. ファイルをクリックして詳細表示
4. 緑色: カバー済み、赤色: 未カバー

---

## テストデータ

### タイマーサンプルデータ

テストで使用する標準的なタイマーデータ:

```typescript
// カウントダウンタイマー
const countdownTimer: CountdownTimer = {
  id: 'test-countdown-1',
  name: 'Test Countdown',
  type: 'countdown',
  targetDate: '2026-12-31T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// スタミナタイマー
const staminaTimer: StaminaTimer = {
  id: 'test-stamina-1',
  name: 'Test Stamina',
  type: 'stamina',
  currentValue: 50,
  maxValue: 100,
  recoveryIntervalMinutes: 5,
  recoveryIntervalSeconds: 300,
  lastUpdatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
```

### 固定日時

テストで使用する固定日時:

```typescript
const now = new Date('2026-06-01T00:00:00.000Z'); // テスト実行時刻
const past = new Date('2026-01-01T00:00:00.000Z'); // 過去の日時
const future = new Date('2026-12-31T00:00:00.000Z'); // 未来の日時
```

---

## 継続的な改善

### カバレッジ維持

- 新機能追加時は必ずテストを追加
- プルリクエストでカバレッジが下がらないことを確認
- CI/CD でカバレッジ 85% 未満を自動検出

### テスト品質向上

- 定期的なテストレビュー
- 重複テストの削除
- テストの可読性改善

### E2E テスト導入

- Phase 4 で Playwright 導入予定
- クリティカルなユーザーフローから優先的に実装
- ブラウザ互換性テストの自動化

---

## トラブルシューティング

### テストが失敗する

1. エラーメッセージを確認
2. `npm run test:watch` でデバッグ
3. `console.log` で中間値を確認
4. 境界値やエッジケースを確認

### カバレッジが上がらない

1. HTML レポートで未カバー部分を確認
2. 分岐やエッジケースのテストを追加
3. 必要に応じて除外リストに追加

### TypeScript エラー

1. `npm run typecheck` で詳細確認
2. 型定義を確認・修正
3. `tsconfig.json` の設定を確認

---

## 参考資料

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Playwright Documentation](https://playwright.dev/)
