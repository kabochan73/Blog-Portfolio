# フロントエンド（Next.js）詳細

対象: `frontend/`（バックエンドは `../backend`、`docker-compose.yml`で連携）

## 0. プロジェクト固有ルール

- `frontend/CLAUDE.md` は `@AGENTS.md` を読み込むだけ。
- `frontend/AGENTS.md`: 「これはあなたの知っているNext.jsではない。破壊的変更があり、API・規約・ファイル構造が
  学習データと異なる可能性がある。コードを書く前に `node_modules/next/dist/docs/` の該当ガイドを読め」との注記あり。
  `package.json`の`next`指定は`16.2.10`で、`revalidateTag(tag, { expire: 0 })`
  （`app/api/revalidate/route.ts`）のように第2引数を取る呼び出しが実際にある。新アプリで同じNext.jsバージョン系を
  使う場合は、通常の記憶にあるAPIと異なる可能性がある前提でドキュメントを確認すること。
- ルート直下の`.vscode/settings.json`に、`*.client.ts(x)`はReactアイコン、`*.server.ts(x)`は緑の
  "react-server"カスタムアイコンを表示する設定あり（`.client`/`.server`命名規則を裏付けるエディタ設定）。

## 1. 全体アーキテクチャ

- **Next.js 16.2.10 / React 19.2.4 / TypeScript**、App Router構成（`app/`）。
- `next.config.ts`で`output: "standalone"`（Railway本番デプロイ用）。
- **`.client` / `.server` サフィックス命名規則**（コミット「Align file naming with SC/CC convention」で統一）:
  - Client Componentは `*.client.tsx`（`"use client"`を明示）。例: `PostBrowser.client.tsx`, `Sidebar.client.tsx`,
    `AdminHeader.client.tsx`
  - Server Component専用ファイルは `*.server.tsx`。例: `app/(public)/components/PostList.server.tsx`
  - サーバー専用ユーティリティは `*.server.ts`。例: `lib/api.server.ts` — `import "server-only"`で
    誤ってクライアントバンドルに混入したらビルドエラーになるよう防御
  - クライアント専用APIクライアントは末尾に`.client`を置く（`api.posts.client.ts`）。以前は
    `api.client.posts.ts`だったが、glob `*.client.ts(x)` にマッチするよう末尾配置に変更した経緯あり
  - サフィックス無し（`page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`）はNext.js規約ファイル
- **ディレクトリ構成**:
  - `app/(public)/` … 公開ページ用ルートグループ（URLに影響しない）。専用`layout.tsx`と`components/`を持つ
  - `app/admin/` … 管理画面。専用`layout.tsx`（認証ガード）と`components/`
  - トップレベルの`components/Sidebar.client.tsx`はpublic/admin両方から共有
  - `lib/` … APIクライアントと認証状態管理、`types/` … 共有型定義（`types/index.ts`のみ）
  - テストは`__tests__/`配下にソースと同じ階層をミラーリング（コロケーションではない、方針として明記）

## 2. ページ構成

| パス | ファイル | 役割 |
|---|---|---|
| `/` | `app/(public)/page.tsx` | 公開トップ。`getPosts`/`getTags`を並列fetch、タグごとに事前フィルタした`PostList`をタグID+`"all"`キーの`Record`として`PostBrowser`に渡す |
| `/posts/[slug]` | `app/(public)/posts/[slug]/page.tsx` | 記事詳細（Server Component、`params`はPromiseでawait）。`getPost`がnullなら`notFound()`。`react-markdown`+`remark-gfm`でレンダリング |
| `/login` | `app/login/page.tsx` | ログインフォーム（Client Component）。`useSearchParams`使用のため`Suspense`でラップ |
| `/admin` | `app/admin/page.tsx` | 管理ダッシュボード。`statusFilter: status === "published"` |
| `/admin/drafts` | `app/admin/drafts/page.tsx` | 下書き一覧。`statusFilter: status === "draft"`、`getTitleHref`でプレビューへリンク |
| `/admin/drafts/[id]` | `app/admin/drafts/[id]/page.tsx` | 下書きプレビュー（Client Component）。編集フォームなし、表示のみ |
| `/admin/posts/new` | `app/admin/posts/new/page.tsx` | 新規作成。`PostForm`＋`onSubmit={createPost}`、成功後`router.push("/admin")`＋`revalidatePublicCache()`（fire-and-forget） |
| `/admin/posts/[id]` | `app/admin/posts/[id]/page.tsx` | 編集。`getAdminPost`で初期値取得し`PostForm`へ |
| `/admin/tags` | `app/admin/tags/page.tsx` | タグ管理（作成・編集・削除を1ページ内に直接実装） |
| `/not-found` | `app/not-found.tsx` | グローバル404ページ |
| `app/api/revalidate` | `app/api/revalidate/route.ts` | Route Handler（POST）。管理画面からのキャッシュ再検証エンドポイント |

## 3. コンポーネント設計

### public側
- **`PostList.server.tsx`**: `posts`と任意の`getHref`を受け取る純粋な表示コンポーネント。リンク先を
  外から関数として注入できる設計（admin側の`getTitleHref`と同じ発想）。ただしPublic版とAdmin版は別ファイル
  （統合されていない）。
- **`PostBrowser.client.tsx`**: `tags`と`postListsByKey`（`Record<string, ReactNode>`）を受け取り、`useState`で
  選択中タグキーを持つだけの**render propsに近いパターン**。親（Server Component）側でタグごとにフィルタ済みの
  `PostList`をReactNodeとして事前生成し、Client Componentにはその「完成品」を渡す、というRSCの典型的な合成パターン。
- **`components/Sidebar.client.tsx`**: タグ一覧＋「すべて」ボタン。`selectedKey`/`onSelect`をpropsで受け取る
  **制御コンポーネント**（状態を持たない）。public/admin両方の`*Browser`から共有される数少ない汎用コンポーネント。

### admin側
- **`AdminHeader.client.tsx`**: ナビゲーション＋ログアウト。ログアウトは`await logout(); router.push("/")`という
  逐次処理に単純化。過去に「ナビゲーションを1箇所に集約する」複雑な案を試したが「複雑さが見合わない」として不採用、
  シンプルな形に戻した経緯がコミットメッセージに明記されている
  （＝過度な抽象化を避ける方針の実例、[[feedback_component_design]]と一致）。
- **`AdminPostBrowser.client.tsx`**: `AdminPostList`＋`Sidebar`の組み合わせ。`statusFilter`（絞り込み関数）と
  `getTitleHref`（リンク先）を関数propsとして注入し、`/admin`と`/admin/drafts`が同じコンポーネントを設定だけ
  変えて再利用。削除処理（`confirm()`→楽観的にstateから除去→`revalidatePublicCache()`）と
  `deleteError`ステートによる失敗表示を持つ。
- **`AdminPostList.client.tsx`**: 表示専用（`posts`, `onDelete`, `getTitleHref`）。
- **`PostForm.client.tsx`**: 投稿の作成・編集共通フォーム。`react-hook-form`＋`zod`。`initialPost`（編集時のみ）、
  `onSubmit`、`submitLabel`を受け取るプレゼンテーション+バリデーションの共通コンポーネント。
  編集/プレビュータブ切替、タグのチェックボックス群、ステータス切り替えを内包。

**設計方針**: 各`*Browser`/`*List`は単なるprops中継ではなく実際に状態（フィルタ、削除、ロード状態）を持ち、
逆に`PostForm`は本当に汎用的な入出力のみを扱う薄い形。全体として「不要な抽象化・中間層を作らない」方針が
随所に見られる。

## 4. API通信

- **fetch APIのみ**（axios等は不使用）。
- **`lib/api.server.ts`**（`import "server-only"`）: `getPosts()`/`getPost(slug)`/`getTags()`。
  サーバー内部用の`API_URL`環境変数を使用（`NEXT_PUBLIC_API_URL`とは別、Docker内部ネットワーク用途）。
  `cache: "force-cache"` + `next: { tags: [...] }` で**オンデマンドISR**。`getPost`は`["posts", "post:${slug}"]`の
  2タグを持つ。try/catchでバックエンド未接続時も例外を投げず空配列/nullを返す
  （デプロイ直後などにビルド/描画自体を落とさないため）。Laravel APIリソースの`{data:...}`ラップを剥がして返す。
- **`lib/api.client.ts`**: `ApiError`クラス（`status`, `message`, `errors: Record<string,string[]>`＝Laravelの
  バリデーションエラー形式）。Cookie認証(Sanctum SPA)のため`authFetch()`は`credentials: "include"`でfetchし、
  GET/HEAD/OPTIONS以外の状態変更リクエストの前に`ensureCsrfCookie()`（`/sanctum/csrf-cookie`を一度だけ叩いて
  `XSRF-TOKEN` cookieを発行させる）を呼んでから、`document.cookie`から読んだ`XSRF-TOKEN`を`X-XSRF-TOKEN`
  ヘッダーに載せる。401時に`markSessionExpired()`→`clearAuth()`。`authFetchJson<T>()`は`!res.ok`なら`ApiError`を
  投げ、`204`は`undefined`を返す。`revalidatePublicCache()`は`POST /api/revalidate`にタグ`["posts","tags"]`を
  送信（同一オリジンのNext.js自身のRoute Handlerへの呼び出しなのでcookieは自動送信される）。
- **`lib/api.posts.client.ts` / `lib/api.tags.client.ts`**: `listAdmin*`/`create*`/`update*`/`delete*`のCRUD関数群。
  `PostInput`型（`title, slug, body, status, tag_ids`）をここで定義。
- **エラーハンドリング**: `e instanceof ApiError`かどうかで分岐（フィールドエラー利用可否）、それ以外は
  `e instanceof Error ? e.message : "汎用日本語メッセージ"`というフォールバックパターンが一貫している。

## 5. 認証（2026-09〜: httpOnly Cookie方式）

以前はSanctumのpersonal access tokenを`sessionStorage`に保存するトークン方式だったが、
セキュリティ向上のためSanctum SPA Cookie認証（httpOnly cookie）に切り替え済み。

- **`lib/auth.client.ts`**: トークンをJSから読めなくなったため、認証状態は
  `{ status: "unknown" | "guest" | "authenticated"; user? }` というオブジェクトで管理し、
  独自subscribe/emitパターン＋React `useSyncExternalStore`で通知する（`useAuthState()`）。
  - `"unknown"` = まだ確認できていない（初回マウント直後）
  - `"guest"` = 確認済み・未ログイン
  - `"authenticated"` = ログイン済み（`user`を含む）
  - `checkAuth()`: `GET /user`を`credentials:"include"`で呼び、200なら`setAuthenticatedUser()`、
    それ以外は`clearAuth()`。httpOnly cookieはJSから直接読めないため、ログイン状態の確認は
    必ずこのサーバー問い合わせを経由する（トークン方式のときの同期的な`sessionStorage`読み取りと違い、
    非同期になる点が設計上の大きな違い）。
  - `setAuthenticatedUser(user)`: ログイン成功時にコントローラーが返す`user`をそのまま渡して呼ぶ。
  - `markSessionExpired()`/`consumeSessionExpired()`は従来通り維持（後述）。
- **`lib/api.client.ts`のCSRF対応**: `ensureCsrfCookie()`が`/sanctum/csrf-cookie`（バックエンドの
  オリジン、`/api`プレフィックス無し）を一度だけ叩いて`XSRF-TOKEN` cookieを発行させ、以降の状態変更
  リクエストでは毎回`document.cookie`から最新の`XSRF-TOKEN`を読んで`X-XSRF-TOKEN`ヘッダーに載せる
  （ログイン/ログアウトでサーバー側がCSRFトークンを再生成するたびcookieも更新されるため、
  ヘッダー側は都度読み直す必要がある）。
- **ログインフロー**（`app/login/page.tsx`）: `authFetchJson<{user}>("/login", {method:"POST", ...})`を
  呼ぶだけで、内部で`ensureCsrfCookie()`→`X-XSRF-TOKEN`付与→`credentials:"include"`が自動的に行われる。
  成功したら`setAuthenticatedUser(user)`して`/admin`へ`router.push`。
- **保護ルート（2層構成）**:
  1. **`proxy.ts`（このNext.jsバージョンでは`middleware.ts`から名称変更されたファイル、規約は同じ）**:
     `/admin`配下すべてに対し、`request.cookies.has(SESSION_COOKIE_NAME)`（既定値`blog_session`、
     バックエンドの`SESSION_COOKIE`環境変数と一致させる）で**cookieの有無だけを見る楽観的チェック**を行い、
     無ければ`/login`へリダイレクト。Next.jsのドキュメント（`node_modules/next/dist/docs/.../authentication.md`）
     が明記する通り、ProxyはプリフェッチのたびDBアクセス等の重い処理をすべきではないため、
     厳密な検証はしない。
  2. **`app/admin/layout.tsx`**: Client Componentとして`useAuthState()`を購読し、`"unknown"`なら
     `checkAuth()`を呼び、`"guest"`なら`router.replace("/login")`（または`/login?expired=1`）で実際の
     有効性を検証する。cookieはあるが期限切れ、というケースはここで捕捉される。
  - つまり「cookie無し」はProxyが即座に弾き、「cookieはあるが無効」はクライアント側の実問い合わせで弾く、
    という役割分担。
- **セッション期限切れの表現**: `sessionExpired`というモジュールスコープの真偽値（Reactステートではない）を
  `markSessionExpired()`でセット、`consumeSessionExpired()`で一度だけ読み取って消費する仕組みは
  トークン方式時代から変更なし。
- **401時の自動処理**: `authFetch`内で`res.status===401`なら`markSessionExpired()`→`clearAuth()`。
- **サーバー側検証**: `app/api/revalidate/route.ts`は、以前は`Authorization`ヘッダーを転送していたが、
  現在はブラウザから同一オリジンで送られてきた`Cookie`ヘッダーをそのままバックエンドの`GET /user`に転送し、
  加えてこのNext.jsサーバー→バックエンドの直接呼び出しには本来のOriginヘッダーが付かないため、
  `NEXT_PUBLIC_APP_URL`（フロントエンドの公開オリジン）を`Origin`ヘッダーとして偽装付与している
  （`EnsureFrontendRequestsAreStateful`のstateful判定がOrigin/Refererを見るため）。

## 6. 状態管理

- **グローバル状態は無し**（Redux/Zustand/Context未使用）。唯一のグローバル的な状態は`lib/auth.client.ts`の
  `useSyncExternalStore`による認証状態（`unknown`/`guest`/`authenticated`）のみ。
- **フォーム状態管理**: `react-hook-form`（`useForm`, `useWatch`, `register`, `handleSubmit`, `setValue`,
  `setError`）＋`zod`スキーマ＋`zodResolver`。使用箇所は`login/page.tsx`と`PostForm.client.tsx`の2箇所。
- **フィールドレベルバリデーションエラー表示**（`PostForm.client.tsx`）:
  - クライアント側zodエラーは`register`と連動して各フィールド直下に表示（基本機能）。
  - **サーバー側バリデーションエラー**（例: スラグ重複）を該当フィールドにマッピング:
    ```ts
    if (e instanceof ApiError && e.errors) {
      let hasFieldError = false;
      for (const [field, messages] of Object.entries(e.errors)) {
        if (field in schema.shape && messages[0]) {
          setError(field as keyof FormValues, { message: messages[0] });
          hasFieldError = true;
        }
      }
      if (!hasFieldError) {
        setSubmitError(e.message);
      }
      return;
    }
    ```
    `field in schema.shape`でzodスキーマに存在するフィールド名だけ`setError`し、該当フィールドが無い場合のみ
    `submitError`（フォーム末尾の汎用エラー）にフォールバックする二段構え。
  - `login/page.tsx`はサーバーエラーを`loginError`という汎用ステートのみで表示（フィールドマッピングは
    意図的に行っていない）。
- **その他のローカル状態**: `useState`を多用する素朴なパターン（`loadError`, `deleteError`, `createError`,
  `editError`など、操作ごとに個別のエラー用stateを持つ一貫したスタイル）。グローバルなトースト通知や
  エラーバウンダリは無い。

## 7. スタイリング

- **Tailwind CSS v4**（`@tailwindcss/postcss`）。`app/globals.css`で`@import "tailwindcss";`と
  `@plugin "@tailwindcss/typography";`（Markdown本文用）。
- **CSS変数**: `--background: #ffffff`, `--foreground: #171717`の固定値のみ。**ダークモード用の
  `prefers-color-scheme`メディアクエリや`dark:`バリアントは一切存在しない**（[[feedback_no_dark_mode]]の方針通り）。
- **デザインの特徴**: 角丸を意図的に排除（カード・タグバッジ）。以前はログインカード・404ページのボタンのみ
  `rounded-2xl`/`rounded-lg`が残っていたが、デザインルールに合わせて除去し統一済み。
- レスポンシブ: `sm:`ブレークポイントで記事一覧とタグサイドバーの並び順を`flex-col`⇔`sm:flex-row`、`order-*`で切替。
- 色使いはZinc系グレースケール＋黒＋エラー用`text-red-600`のみのモノトーン基調。

## 8. 管理画面機能

### 投稿管理
- 作成: `/admin/posts/new` → `PostForm` → `createPost`（`POST /admin/posts`）
- 編集: `/admin/posts/[id]` → `getAdminPost`で初期値 → `PostForm` → `updatePost`（`PUT /admin/posts/{id}`）
- 一覧: `/admin`（公開済み）、`/admin/drafts`（下書き）— どちらも`AdminPostBrowser`を共有し`statusFilter`で絞り込み
- 削除: `AdminPostBrowser.client.tsx`の`handleDelete`（`confirm()`→`deletePost`→`revalidatePublicCache()`）

### タグ管理（`app/admin/tags/page.tsx`）
- 作成・編集（インライン編集: `editingId`/`editingName`で対象行だけ入力欄に切替）・削除を1ページ内に直接実装
  （子コンポーネントに分割されていない）
- 成功後はローカルstateを直接更新（`sort`で名前順、`prev?.map`で置換）＋`revalidatePublicCache()`

### 削除失敗時のハンドリング
- 変更前は「削除失敗（ネットワークエラー、403等）が静かに投げられ、フィードバックが無かった」問題があった。
- `AdminPostBrowser.client.tsx`のパターン:
  ```ts
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const handleDelete = async (id: number) => {
    if (!confirm("この記事を削除しますか？")) return;
    setDeleteError(null);
    try {
      await deletePost(id);
      setPosts((prev) => prev?.filter((post) => post.id !== id) ?? null);
      await revalidatePublicCache();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };
  ```
  失敗時は`deleteError`を一覧上部に赤字で表示。`app/admin/tags/page.tsx`も同様のtry/catchパターン。
- **楽観的更新はAPI成功後にのみ行う**（先にstateを変更しないため、失敗時にstateがずれることはない）。

## 9. 型定義（`types/index.ts`）

```ts
export type ApiResponse<T> = {
  data: T;
};

export type PostStatus = "draft" | "published";

export type Tag = {
  id: number;
  name: string;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  body: string;
  status: PostStatus;
  tags: Tag[];
  created_at: string;
  updated_at: string;
};
```

- Laravel APIリソースの`{data:...}`ラッパーは共通の`ApiResponse<T>`型として切り出し済み
  （以前は各APIクライアント関数内で`authFetchJson<{ data: Post[] }>(...)`のようにインライン注釈が
  重複していた）。`lib/api.server.ts`・`lib/api.posts.client.ts`・`lib/api.tags.client.ts`から利用。
- `PostInput`型（フォーム送信用）は`types/index.ts`ではなく`lib/api.posts.client.ts`側に定義されている。

## 10. テスト

- **Jest 30 + `next/jest`**、`testEnvironment: "jsdom"`、`@testing-library/react`系。
  `moduleNameMapper`で`@/*`パスをtsconfigと一致させる。
- **配置方針**: `__tests__/`配下にソースと同じディレクトリ構造をミラーリング（コロケーションではない）。
- **テスト対象**: 表示系コンポーネントのみ（`PostList`, `AdminPostList`, `Sidebar`, `PostBrowser`, `AdminHeader`）。
  API通信を伴うページ（`AdminPostBrowser`, `PostForm`, 各`page.tsx`）や`lib/`のAPIクライアント自体、
  `auth.client.ts`にはテストが無い。
- テスト名はすべて日本語。`npm test` → `jest`。

## 11. デプロイ設定

### `Dockerfile`（ローカル開発用）
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```
`docker-compose.yml`でソースをボリュームマウント（`/app/node_modules`は匿名ボリューム）してホットリロード。
`NEXT_PUBLIC_API_URL=http://localhost:8000/api`（ブラウザ用）、`API_URL=http://backend:8000/api`
（サーバー用、Dockerネットワーク経由）に加え、Cookie認証用の`NEXT_PUBLIC_APP_URL`（フロントエンド自身の
公開オリジン、revalidateルートのOrigin偽装用）・`NEXT_PUBLIC_SESSION_COOKIE_NAME`（`proxy.ts`のcookie名判定用、
バックエンドの`SESSION_COOKIE`と一致させる）を渡す。

### `Dockerfile.railway`（本番用、マルチステージ）
- `deps`: `npm ci`のみ
- `builder`: `ARG API_URL` / `ARG NEXT_PUBLIC_API_URL` / `ARG NEXT_PUBLIC_APP_URL` /
  `ARG NEXT_PUBLIC_SESSION_COOKIE_NAME`をビルド引数として受け取り`npm run build`。
  ビルド時の公開ページ静的生成(SSG)がバックエンドにfetchするため、ビルド時点で到達可能なAPI URLが必要。
  `NEXT_PUBLIC_*`はNext.jsがビルド時にクライアント/サーバーコードへインライン化するため、実行時ではなく
  ビルド時に渡す必要がある点に注意（`proxy.ts`もサーバーコードだがこの制約を受ける）。
- `runner`: `node:20-alpine`、standaloneビルド成果物のみコピーし`node server.js`で起動

### `railway.toml`
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.railway"

[deploy]
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```
