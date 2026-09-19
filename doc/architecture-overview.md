# アーキテクチャ概要

## 構成

```
Blog-Portfolio/
├── backend/    Laravel 13 (PHP 8.3/8.4) — API専用バックエンド
├── frontend/   Next.js 16 (React 19, TypeScript) — App Router
└── docker-compose.yml  ローカル開発用（backend + frontend + DB連携）
```

- バックエンドとフロントエンドは完全に分離した別プロセス（Laravelはビューを持たない純粋なJSON API）。
- ローカルは `docker-compose.yml` で連携。フロントエンドのビルド時に
  `NEXT_PUBLIC_API_URL`（ブラウザ→backend直接）と `API_URL`（Next.jsサーバー→backend、Docker内部ネットワーク経由）を
  分けて渡している点がポイント。Cookie認証のため`NEXT_PUBLIC_APP_URL`・`NEXT_PUBLIC_SESSION_COOKIE_NAME`
  （フロントエンド側）と`FRONTEND_URL`・`SANCTUM_STATEFUL_DOMAINS`・`SESSION_COOKIE`（バックエンド側）も連携させる。
- 本番は両方とも Railway に個別デプロイ（`railway.toml` を各ディレクトリに配置）。
- **フロントエンドとバックエンドが異なるトップレベルドメインになる場合、Sanctum SPA Cookie認証は成立しない**
  （ブラウザのCookieがサイトをまたいで送られないため）。本番では同じ最上位ドメインの異なるサブドメイン
  （例: `app.example.com`と`api.example.com`、`SESSION_DOMAIN=.example.com`）で運用する必要がある。

## 技術スタック

| 層 | 技術 |
|---|---|
| バックエンド | Laravel 13, PHP 8.3+, Laravel Sanctum（SPA Cookie認証）, PostgreSQL, Nginx + PHP-FPM + Supervisor, Pest（テスト） |
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, react-hook-form + zod, Jest + Testing Library |
| インフラ | Railway（Dockerfileビルド）, Docker/Docker Compose（ローカル） |

## ドメインモデル

- **Post**（記事）: `title`, `slug`（unique）, `body`, `status`(`draft`/`published`)
- **Tag**（タグ）: `name`（unique）
- Post ⇔ Tag は多対多（中間テーブル `post_tag`、カスケード削除）
- **User**（管理者）: 認証専用。ロールや所有権の概念は無く、ログインしていれば全記事・全タグを操作可能

## API/画面の対応関係

| バックエンドAPI | フロントエンドの利用箇所 |
|---|---|
| `GET /api/posts`, `GET /api/posts/{slug}`, `GET /api/tags`（認証不要） | `lib/api.server.ts`（Server Componentからの公開ページ用フェッチ、ISRキャッシュ付き） |
| `GET /sanctum/csrf-cookie`（`web`, Sanctum標準） | `lib/api.client.ts`の`ensureCsrfCookie()`（状態変更リクエスト前にCSRF cookieを発行させる） |
| `POST /api/login`, `POST /api/logout`, `GET /api/user`（`auth:sanctum`, Cookie認証） | `lib/auth.client.ts`, `app/login/page.tsx`, `app/api/revalidate/route.ts`（cookie検証用） |
| `/api/admin/posts`, `/api/admin/tags`（`apiResource`, `auth:sanctum`） | `lib/api.posts.client.ts`, `lib/api.tags.client.ts`（管理画面のCRUD） |

詳細は [backend.md](./backend.md) / [frontend.md](./frontend.md) を参照。
