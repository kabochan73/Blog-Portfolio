# Blog-Portfolio ドキュメント

このフォルダは、既存の Blog-Portfolio（Laravel + Next.js のブログアプリ）のコードを
隅々まで調査し、「また新しいブログアプリを作る」ための参考資料としてまとめたものです。

- [architecture-overview.md](./architecture-overview.md) — 全体構成・技術スタックのサマリー
- [backend.md](./backend.md) — Laravel バックエンドの詳細（DB設計・API・認証・デプロイ）
- [frontend.md](./frontend.md) — Next.js フロントエンドの詳細（画面構成・コンポーネント設計・認証・デプロイ）
- [rebuild-notes.md](./rebuild-notes.md) — 新しいブログアプリを作る際に踏襲/見直すべきポイントの整理

## このアプリのひとことまとめ

「記事（Post）＋タグ（Tag）」のシンプルな多対多構成のブログ。
公開側は認証不要の読み取り専用API、管理画面はSanctum SPA Cookie認証必須のフルCRUD、という2層構成。
ロールベースの権限は無く「ログインしているか否か」のみで認可している。

- バックエンド: Laravel 13 + Sanctum(Cookie認証) + PostgreSQL、Railway + Docker（Nginx + PHP-FPM + Supervisor）
- フロントエンド: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4、Railway + Docker（standalone build）
- 2026-07-19 に「完成」宣言済み、2026-09に認証方式・CORS・本番サーバー構成などを見直し（[rebuild-notes.md](./rebuild-notes.md)参照）
