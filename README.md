# Blog Portfolio

簡単なBlogアプリです。志望動機や、ポートフォリオの選定理由、自分の理解度を示すのが目的です。

## 本番環境

| サービス   | URL                                                              |
| ---------- | ----------------------------------------------------------------- |
| 公開サイト | https://frontend-production-167e.up.railway.app                  |
| 管理画面   | https://frontend-production-167e.up.railway.app/login             |
| API        | https://backend-production-ae24.up.railway.app/api                |

## 技術スタック

| レイヤー | 技術・ライブラリ                                              |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 16.2 (App Router) / React 19 / TypeScript 5           |
| スタイル | Tailwind CSS v4 / @tailwindcss/typography                     |
| Markdown | react-markdown 10 / remark-gfm / rehype-highlight             |
| Backend  | Laravel 13 / PHP 8.4                                          |
| 認証     | Laravel Sanctum 4（Bearer トークン）                          |
| DB       | PostgreSQL 16                                                 |
| インフラ | Docker (nginx + php-fpm + supervisor) / Railway（本番ホスティング） |
| テスト   | PHPUnit 12（backend） / Jest 30 + Testing Library（frontend） |

## Docker構成

- nginx: APIリバースプロキシ
- php-fpm: Laravel実行
- supervisor: プロセス管理
- PostgreSQL: データ保存
- Next.js: フロントエンド

## 起動方法

### 前提

- Docker / Docker Compose がインストールされていること

### 環境変数

`backend/.env` を作成する。

```env
APP_KEY=
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=blog_portfolio
DB_USERNAME=blog_user
DB_PASSWORD=blog_password

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_password
```

### コンテナ起動

```bash
docker compose up -d
```

### 初期セットアップ（初回のみ）

```bash
# マイグレーション + シーダー
docker compose exec backend php artisan migrate --seed

# アプリキー生成（.env に APP_KEY が未設定の場合）
docker compose exec backend php artisan key:generate
```

### アクセス

| サービス   | URL                         |
| ---------- | --------------------------- |
| 公開サイト | http://localhost:3000       |
| 管理画面   | http://localhost:3000/login |
| API        | http://localhost:8080/api   |
| pgAdmin    | http://localhost:5050       |

管理画面のログイン情報は `.env` の `ADMIN_EMAIL` / `ADMIN_PASSWORD` を使用。

## API エンドポイント

### 公開

| メソッド | パス                   | 説明     |
| -------- | ---------------------- | -------- |
| GET      | `/api/articles`        | 記事一覧 |
| GET      | `/api/articles/{slug}` | 記事詳細 |
| GET      | `/api/tags`            | タグ一覧 |
| POST     | `/api/login`           | ログイン |

### 管理（要認証）

| メソッド       | パス                       | 説明                 |
| -------------- | -------------------------- | -------------------- |
| POST           | `/api/logout`              | ログアウト           |
| GET/POST       | `/api/admin/articles`      | 記事一覧・作成       |
| GET/PUT/DELETE | `/api/admin/articles/{id}` | 記事取得・更新・削除 |
| GET/POST       | `/api/admin/tags`          | タグ一覧・作成       |
| PUT/DELETE     | `/api/admin/tags/{id}`     | タグ更新・削除       |

## テスト

```bash
# バックエンド
docker compose exec backend php artisan test

# フロントエンド
docker compose exec frontend npm test
```
