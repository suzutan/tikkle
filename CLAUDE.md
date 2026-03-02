# Tikkle - Development Guide

## Project Overview

タイマー管理アプリ。Hono + Cloudflare Pages + D1 (SQLite) で構成。

## Tech Stack

- **Runtime**: Cloudflare Pages (Workers)
- **Framework**: Hono (SSR with `hono/jsx`)
- **Database**: Cloudflare D1 + Drizzle ORM
- **Frontend**: htmx + Alpine.js (CDN) + Tailwind CSS (CDN)
- **Client bundle**: Vite (domain logic を Alpine.js data として公開)
- **Test**: Vitest
- **Language**: TypeScript (strict)

## Commands

```bash
npm run dev           # Vite dev server
npm run build         # Server build + Client build
npm run preview       # wrangler pages dev (ローカルプレビュー)
npm test              # vitest run
npm run test:watch    # vitest (watch mode)
npm run typecheck     # tsc --noEmit
npm run db:generate   # drizzle-kit generate (マイグレーション生成)
npm run db:migrate:local   # D1 ローカルマイグレーション
npm run db:migrate:remote  # D1 リモートマイグレーション
```

## Project Structure

```
src/
  domain/timer/     # 純粋なドメインロジック (フレームワーク非依存)
  lib/              # 共有ユーティリティ
  db/               # Drizzle スキーマ
  repository/       # D1 リポジトリ
  views/            # Hono JSX コンポーネント (SSR)
  client/           # クライアントバンドル (Alpine.js data)
  index.tsx         # Hono アプリ (ルーティング + API)
  renderer.tsx      # HTML レイアウト
```

## Development Principles

### 修正には必ずテストを伴わせる

コードを修正・追加したら、対応するテストコードも必ず修正・追加すること。テストなしのコード変更は不完全な作業とみなす。

### テストを書けるコード設計

ロジックはテスト可能な単位に分離する。ファイル内部のプライベート関数にロジックを閉じ込めず、テスト可能なモジュールとして export する。

### コミット → Push → CI 確認

修正を行ったら必ず以下のサイクルを回す:
1. `npm run typecheck` + `npm test` をローカルで確認
2. コミット & Push
3. CI (GitHub Actions) の成功を確認
4. プレビュー環境で動作確認

### Timezone

サーバー (Cloudflare Workers) は UTC で動作する。datetime-local 入出力は JST (+09:00) を前提とする。変換には `src/lib/timezone.ts` を使う。

### テストの書き方

- ファイル配置: `src/**/__tests__/*.test.ts`
- Given-When-Then コメントで構造化
- テストフレームワーク: Vitest (`import { describe, test, expect } from 'vitest'`)

### 12-Factor App

- 環境ごとの設定は環境変数で管理
- Production DB と Preview DB は分離 (`wrangler.toml` の `preview_database_id`)
