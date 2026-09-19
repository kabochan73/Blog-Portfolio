# 新しいブログアプリを作る際のメモ

既存実装のうち、そのまま踏襲すると良さそうな点と、見直しの余地がある点を整理。

## 踏襲すると良さそうな点

- **`.client`/`.server` ファイル命名規則**: Server/Client境界の取り違えをファイル名レベルで防げる実用的な工夫。
  `import "server-only"` と組み合わせると誤用がビルドエラーになり安全。エディタのアイコン色分け設定
  （[[feedback_client_server_naming]]）と組み合わせると視認性も高い。
- **オンデマンドISR**（`cache:"force-cache"` + `next.tags` + 管理操作後の`revalidateTag`）は、静的生成の速さと
  即時反映性を両立する定番パターン。ただし`revalidatePublicCache()`の多くの呼び出しはawaitせずfire-and-forgetに
  している（速度優先の判断）。
- **フォームのサーバーバリデーションエラー→フィールドマッピング**（`PostForm.client.tsx`）は、Laravelの422エラー
  形式とreact-hook-formの`setError`をつなぐ橋渡しとしてそのまま流用しやすい。
- **削除失敗時のエラー表示**は、楽観的更新をAPI成功後にのみ行う（先にstateを変更しない）設計を踏襲すると安全。
- **ログイン失敗時にユーザー存在確認とパスワード誤りを区別しない**（emailフィールドに統一エラー）というユーザー
  列挙攻撃対策は継続すべき。
- **`ModelNotFoundException`→`NotFoundHttpException`変換後にcatchする**404ハンドリングは、内部クラス名の漏洩を
  防ぐ再利用可能なパターン。
- **薄いラッパーを作らない・render propsで親から完成品を渡す**というコンポーネント設計方針
  （[[feedback_component_design]]）は今回のコードベースでも一貫しており、継続する。
- コンポーネント設計とテストの方針: 表示系コンポーネントを純粋な関数として保ち（props→表示のみ）、
  ロジックを持つコンポーネント（`*Browser`）と分離するとテストが書きやすい。

## 見直し済み（2026-09、このリポジトリで対応済み）

このフォルダをベースに新アプリを作る前段階として、以下は実際にこのリポジトリのコードに対して修正し、
テスト・実機（Docker）検証済み。新アプリでもこの状態を出発点にしてよい。

- **認証をhttpOnly Cookie方式に切り替え済み**: Sanctum SPA Cookie認証（`$middleware->statefulApi()`）。
  `AuthController`は`Auth::attempt()`+セッション方式に変更、フロントエンドは`sessionStorage`のトークンを廃止し
  `lib/auth.client.ts`の`checkAuth()`（`GET /user`への問い合わせ）で認証状態を確認する非同期モデルに変更。
  CSRF対策として`ensureCsrfCookie()`＋`X-XSRF-TOKEN`ヘッダーを追加。詳細は[backend.md](./backend.md)の
  認証節と[frontend.md](./frontend.md)の「5. 認証」を参照。
  - **前提**: フロントエンドとバックエンドが異なるトップレベルドメインだとCookieが共有されないため成立しない。
    本番では同じ最上位ドメインの異なるサブドメインで運用する必要がある（[architecture-overview.md](./architecture-overview.md)参照）。
- **CORSを明示設定**: `config/cors.php`を追加し、`supports_credentials: true`＋`FRONTEND_URL`由来の
  明示的なオリジンのみ許可（ワイルドカード`'*'`は廃止）。
- **サーバーサイドの認証チェックを追加**: `frontend/proxy.ts`（このNext.jsバージョンでの`middleware.ts`相当）で
  `/admin`配下へのアクセス時にセッションcookieの有無を楽観的にチェックし、無ければ`/login`へリダイレクト。
  厳密な検証（期限切れ等）は引き続きクライアント側の`admin/layout.tsx`が担当する2層構成。
- **本番Laravelを`php artisan serve`からNginx + PHP-FPM + Supervisor構成に変更**: `backend/Dockerfile`を
  `php:8.4-fpm`ベースに切り替え、`docker/nginx.conf.template`（`envsubst`で`$PORT`を注入）と
  `docker/supervisord.conf`を追加。ローカル(`docker-compose.yml`)も同じDockerfileを使う。
- **`ApiResponse<T>`共通型を追加**: `types/index.ts`に`{ data: T }`のジェネリック型を定義し、各APIクライアント
  関数のインライン型注釈の重複を解消。
- **デザインの角丸不整合を解消**: ログインカード・404ページのボタンから`rounded-*`を除去し、他画面と統一。

## 意図的に対応しなかった点（今回はスコープ外）

- **ページネーション・検索・フィルタ**: 今回は不要と判断し見送り。API側は引き続き全件取得のみ。
  将来記事数が増えた場合は追加を検討。
- **ロールベースの認可**: 単一管理者のまま維持。複数管理者や権限差が必要になったらPolicy/Roleの導入を検討。
- **Public版とAdmin版のPostList/PostFormが別実装**（`PostList.server.tsx`と`AdminPostList.client.tsx`）のまま。
  既存コードはあえて分離を選んでいる（薄い共通化より個別実装を優先する方針との整合）。
  新アプリで統合するかどうかは要件次第で都度判断する。

## 確認しておきたい前提

- `frontend/AGENTS.md`に「このNext.jsは学習データと異なる可能性がある」との注記があり、`next@16.2.10`という
  実際の最新安定版より先のバージョン番号が使われている。新アプリで同系統のNext.jsを使う場合、
  `node_modules/next/dist/docs/`のドキュメントを都度確認する運用を引き継ぐか検討する。
- ダークモードは使わない方針（[[feedback_no_dark_mode]]）。新アプリでも同じ方針か、必要なら最初から
  `prefers-color-scheme`対応を組み込むか、要確認。
