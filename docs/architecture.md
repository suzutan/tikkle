# アーキテクチャ設計

## システム概要

Tikkle は Cloudflare Pages + Workers 上で動作する、サーバーサイドレンダリング（SSR）ベースのタイマー管理アプリケーションです。

```
┌─────────────────────────────────────────────┐
│         Cloudflare Pages (CDN)              │
│  ┌───────────────────────────────────────┐  │
│  │    Static Assets (CSS, Images, JS)    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       Cloudflare Workers (Edge Runtime)      │
│  ┌───────────────────────────────────────┐  │
│  │           Hono Application            │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   SSR (Hono JSX)                │  │  │
│  │  │   - Views (timer-card, form)    │  │  │
│  │  │   - Renderer (layout)           │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   API Routes                    │  │  │
│  │  │   - POST /api/timers            │  │  │
│  │  │   - PUT /api/timers/:id         │  │  │
│  │  │   - DELETE /api/timers/:id      │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   Domain Logic                  │  │  │
│  │  │   - Timer types & validation    │  │  │
│  │  │   - Computation logic           │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   Repository Layer              │  │  │
│  │  │   - D1TimerRepository           │  │  │
│  │  │   - Drizzle ORM                 │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       Cloudflare D1 (SQLite Database)       │
│  ┌───────────────────────────────────────┐  │
│  │         timers table                  │  │
│  │  - id, name, type, tags               │  │
│  │  - targetDate, startDate              │  │
│  │  - currentValue, maxValue             │  │
│  │  - recoveryIntervalSeconds            │  │
│  │  - scheduleTimes, lastUpdatedAt       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│              Browser (Client)               │
│  ┌───────────────────────────────────────┐  │
│  │   Alpine.js (Client-side Logic)       │  │
│  │   - timerDisplay (real-time updates)  │  │
│  │   - timerForm (form validation)       │  │
│  │   - darkMode (theme toggle)           │  │
│  │   - filtering (client-side filter)    │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │   htmx (Partial Updates)              │  │
│  │   - DELETE /api/timers/:id            │  │
│  │   - Dynamic element swapping          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## レイヤー構成

### 1. Presentation Layer (Views)

**責務:** HTML を生成し、ユーザーに表示する

- `src/views/timer-card.tsx`: タイマーカード、リストアイテムコンポーネント
- `src/views/timer-form.tsx`: タイマー作成・編集フォーム
- `src/renderer.tsx`: 共通レイアウト（ヘッダー、フッター、ダークモード）

**技術:**
- Hono JSX による SSR
- Tailwind CSS によるスタイリング
- Alpine.js によるクライアント側リアクティビティ
- htmx による部分更新

**テスト戦略:**
- E2Eテストでカバー（ユニットテストは除外）

---

### 2. Application Layer (Routes & Controllers)

**責務:** HTTP リクエストを処理し、ドメインロジックを呼び出す

- `src/index.tsx`: ルーティング、リクエストハンドリング
  - `GET /`: タイマー一覧ページ
  - `GET /timers/new`: 新規作成ページ
  - `GET /timers/:id/edit`: 編集ページ
  - `POST /api/timers`: タイマー作成 API
  - `POST /api/timers/:id` (with `_method=put`): タイマー更新 API
  - `DELETE /api/timers/:id`: タイマー削除 API

**技術:**
- Hono フレームワーク
- Zod によるバリデーション

**テスト戦略:**
- E2Eテストでカバー（ユニットテストは除外）

---

### 3. Domain Layer (Business Logic)

**責務:** タイマーの種類、計算ロジック、バリデーションを提供

**構成:**
- `src/domain/timer/types.ts`: タイマー型定義
- `src/domain/timer/validation.ts`: Zod スキーマによる入力バリデーション
- `src/domain/timer/compute-*.ts`: 各タイマー種別の計算ロジック
  - `compute-countdown.ts`: カウントダウンタイマー
  - `compute-elapsed.ts`: 経過時間タイマー
  - `compute-countdown-elapsed.ts`: カウントダウン→経過タイマー
  - `compute-stamina.ts`: スタミナ回復タイマー
  - `compute-periodic-increment.ts`: 定期増加タイマー
- `src/domain/timer/compute.ts`: 統合計算関数
- `src/domain/timer/format.ts`: 表示フォーマット関数
- `src/domain/timer/schedule.ts`: 次回スケジュール計算
- `src/domain/timer/index.ts`: パブリック API

**設計原則:**
- フレームワーク非依存: ドメインロジックは Hono や Cloudflare に依存しない
- 純粋関数: 副作用のない、テスト可能な関数
- 型安全性: TypeScript strict モードでの厳密な型定義

**テスト戦略:**
- ユニットテスト: 100% カバレッジ目標
- Given-When-Then 形式でテストを構造化

---

### 4. Infrastructure Layer (Repository & Database)

**責務:** データの永続化とデータベースアクセス

**構成:**
- `src/repository/timer.ts`: D1TimerRepository クラス
  - `toTimer()`: DBレコード → タイマー型への変換
  - `toInsertValues()`: 入力 → DBレコードへの変換
  - `getAll()`: 全タイマー取得
  - `getById()`: ID指定で取得
  - `create()`: タイマー作成
  - `update()`: タイマー更新
  - `delete()`: タイマー削除
- `src/db/schema.ts`: Drizzle ORM スキーマ定義

**技術:**
- Cloudflare D1 (SQLite)
- Drizzle ORM
- drizzle-kit によるマイグレーション管理

**テスト戦略:**
- ユニットテスト: 変換関数 (toTimer, toInsertValues) は 100% カバレッジ
- E2Eテスト: リポジトリメソッドは統合テストでカバー

---

### 5. Client-side Logic

**責務:** ブラウザ上でのリアルタイム更新とインタラクション

**構成:**
- `src/client/timer-display.ts`: タイマー表示ロジック（Alpine.js data）
  - 1秒ごとの自動更新
  - 残り時間/経過時間の計算
  - 進捗率の計算
  - 完全回復時刻の計算
- `src/client/timer-form.ts`: フォーム動的制御（Alpine.js data）
- `src/client/dark-mode.ts`: ダークモード切り替え（Alpine.js data）

**技術:**
- Alpine.js: リアクティブデータバインディング
- LocalStorage: クライアント設定の永続化

**テスト戦略:**
- E2Eテストでカバー（ユニットテストは除外）

---

## データフロー

### タイマー作成フロー

```
1. User submits form
   ↓
2. POST /api/timers
   ↓
3. parseFormToInput() - フォームデータを CreateTimerInput に変換
   ↓
4. createTimerSchema.safeParse() - Zod バリデーション
   ↓
5. repo.create(input) - D1TimerRepository でDBに保存
   ↓
6. Redirect to / - タイマー一覧にリダイレクト
   ↓
7. SSR renders timer list - Hono JSX でタイマー一覧を生成
   ↓
8. Alpine.js hydrates - クライアント側でリアルタイム更新開始
```

### タイマー表示フロー

```
1. GET /
   ↓
2. repo.getAll() - 全タイマー取得
   ↓
3. SSR renders - TimerCard コンポーネントで各タイマーをレンダリング
   ↓
4. HTML returned - クライアントに HTML を返す
   ↓
5. Alpine.js initializes - timerDisplay() が各タイマーに対して初期化
   ↓
6. setInterval(1000) - 1秒ごとに状態を再計算
   ↓
7. Alpine.js updates DOM - リアクティブに表示を更新
```

---

## 設計パターン

### Repository Pattern

データベースアクセスロジックをカプセル化し、ドメインロジックから分離します。

```typescript
class D1TimerRepository {
  async getAll(): Promise<Timer[]> { /* ... */ }
  async getById(id: string): Promise<Timer | undefined> { /* ... */ }
  async create(input: CreateTimerInput): Promise<Timer> { /* ... */ }
  async update(id: string, input: UpdateTimerInput): Promise<Timer> { /* ... */ }
  async delete(id: string): Promise<void> { /* ... */ }
}
```

**利点:**
- ドメインロジックがDB実装に依存しない
- テストでモックに置き換え可能
- DB実装の変更が容易

---

### Strategy Pattern (計算ロジック)

各タイマー種別ごとに異なる計算ロジックを分離します。

```typescript
function computeTimer(timer: Timer, now: Date): TimerState {
  switch (timer.type) {
    case 'countdown': return computeCountdown(timer, now);
    case 'elapsed': return computeElapsed(timer, now);
    case 'stamina': return computeStamina(timer, now);
    // ...
  }
}
```

**利点:**
- 新しいタイマー種別の追加が容易
- 各種別のロジックが独立してテスト可能
- コードの可読性と保守性が向上

---

### Discriminated Union (型安全性)

TypeScript の Discriminated Union でタイマー種別を型安全に扱います。

```typescript
type Timer =
  | CountdownTimer
  | ElapsedTimer
  | CountdownElapsedTimer
  | StaminaTimer
  | PeriodicIncrementTimer;
```

**利点:**
- 存在しないプロパティへのアクセスをコンパイル時に検出
- switch 文での網羅性チェック
- リファクタリング時の安全性向上

---

## セキュリティ設計

### XSS対策

- ユーザー入力は全て Hono JSX でエスケープされる
- JSON シリアライズ時に `<` を `\u003c` にエスケープ
- innerHTML は使用せず、Alpine.js のテキストバインディング (`x-text`) を使用

### SQLインジェクション対策

- Drizzle ORM によるプリペアドステートメント使用
- 生SQLは使用しない

### CSRF対策

- Cloudflare Pages では Same-Site Cookie が自動的に設定される
- 重要な操作は POST/PUT/DELETE メソッドで実行

---

## パフォーマンス最適化

### SSR + クライアント側ハイドレーション

- 初回ロードは SSR で高速表示
- Alpine.js でクライアント側のリアクティビティを追加
- JavaScript が無効でも基本的な表示は可能

### CDN エッジキャッシング

- 静的アセット（CSS, JS, 画像）は Cloudflare CDN でキャッシュ
- HTML はエッジで生成（低レイテンシ）

### クライアント側フィルタリング

- タイマーフィルターはクライアント側で実行（ページリロード不要）
- Alpine.js の `x-show` で高速な表示/非表示切り替え

### データベース最適化

- `createdAt` カラムにインデックス（DESC順ソート用）
- `id` カラムに PRIMARY KEY インデックス

---

## スケーラビリティ

### 現在の制約

- Cloudflare D1 の制限:
  - データベースサイズ: 500MB（無料プラン）
  - リクエストあたりのレイテンシ: ~5ms
- 想定ユーザー数: 1,000人
- 想定タイマー数: 10,000件

### 将来の拡張性

- マルチユーザー対応: 認証機能追加（Cloudflare Access）
- データ増加対応: ページネーション、仮想スクロール
- 高負荷対応: Workers KV キャッシング、リードレプリカ

---

## デプロイメント戦略

### 環境分離

- **Production**: `https://tikkle.pages.dev/` (main ブランチ)
- **Preview**: `https://<branch>.tikkle.pages.dev/` (プルリクエスト)

### データベース分離

- Production DB: `tikkle-db` (wrangler.toml `database_id`)
- Preview DB: `tikkle-db-preview` (wrangler.toml `preview_database_id`)

### CI/CD

- GitHub Actions による自動デプロイ
- マージ前に以下を実行:
  - TypeScript 型チェック (`npm run typecheck`)
  - テスト (`npm test`)
  - カバレッジチェック（85% 以上）

### マイグレーション

- `npm run db:generate` - Drizzle Kit でマイグレーション SQL 生成
- `npm run db:migrate:local` - ローカル D1 にマイグレーション適用
- `npm run db:migrate:remote` - リモート D1 にマイグレーション適用

---

## 技術的負債と今後の改善点

### 現在の技術的負債

1. **E2Eテスト不足**: 現在ユニットテストのみで、E2Eテストが未実装
2. **エラーハンドリング**: グローバルエラーハンドラーが未実装
3. **ロギング**: 構造化ロギングが未実装

### 改善計画

1. **E2Eテスト導入**: Playwright によるブラウザテスト
2. **エラーハンドリング強化**: グローバルエラーハンドラー、ユーザーフレンドリーなエラーメッセージ
3. **監視・ロギング**: Cloudflare Analytics、Sentry 統合
4. **アクセシビリティ改善**: ARIA ラベル、キーボードナビゲーション
5. **国際化対応**: i18n ライブラリ導入、多言語対応
