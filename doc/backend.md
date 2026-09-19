# バックエンド（Laravel）詳細

対象: `backend/`

## 1. 全体アーキテクチャ

- **フレームワーク**: Laravel `^13.8`（`composer.json`）、PHP `^8.3` 要求（Dockerfileは `php:8.4-fpm`）
- **主要パッケージ**:
  - `laravel/sanctum ^4.3` — API認証（Cookieベース、SPA認証）
  - `laravel/tinker ^3.0`
  - dev: `pestphp/pest ^4.7`（+`pest-plugin-laravel`）— テストはPest記法
  - `laravel/pint` — コードフォーマッタ（CIで `--test` 実行）
- **APIオンリー構成**: `bootstrap/app.php` で `redirectGuestsTo(fn () => null)` とし、未認証時にLaravelデフォルトの
  `login` 名前付きルートへリダイレクトさせず、常に401 JSONを返すよう明示的にカスタマイズ。
- **認証方式**: Sanctum の SPA Cookie認証（`$middleware->statefulApi()`）。Bearerトークンではなく、
  `config('sanctum.stateful')` に登録したフロントエンドのオリジンからのリクエストのみ、httpOnlyな
  セッションcookieで認証される。CSRF対策として `/sanctum/csrf-cookie` から発行される`XSRF-TOKEN` cookieを
  フロントエンドが`X-XSRF-TOKEN`ヘッダーに載せて送る必要がある。
  （2026-09時点でトークン方式からこの方式に切り替え済み。旧`personal_access_tokens`テーブル/`HasApiTokens`
  トレイトは残っているが未使用）。
- **ディレクトリ構成の特徴**:
  - Laravel 13の属性ベース定義を採用: モデルで `protected $fillable` の代わりに `#[Fillable([...])]`、
    `#[Hidden([...])]` というPHP属性を使用。
  - `app/Http/Middleware` ディレクトリは無し。ミドルウェア設定は `bootstrap/app.php` の `withMiddleware()` に集約（Laravel 11+の慣習）。
  - `app/Policies` も無し。認可は「認証済みかどうか」のみで完結し、所有権チェック等は無い
    （管理者は全記事・全タグを操作可能）。
  - コントローラーは「公開用」（`PostController`, `TagController`）と「管理用」（`Admin/PostController`, `Admin/TagController`）に分離。
  - `app/Http/Requests/Admin/` にFormRequestが4つ（Store/Update × Post/Tag）。公開側は読み取り専用のためRequestクラス無し。
  - `app/Http/Resources/` にAPIリソース（`PostResource`, `TagResource`）。

## 2. データベース設計

### テーブル一覧

| マイグレーション | テーブル |
|---|---|
| `0001_01_01_000000_create_users_table.php` | `users`, `password_reset_tokens`, `sessions` |
| `0001_01_01_000001_create_cache_table.php` | `cache`, `cache_locks` |
| `0001_01_01_000002_create_jobs_table.php` | `jobs`, `job_batches`, `failed_jobs` |
| `2026_07_17_044556_create_tags_table.php` | `tags` |
| `2026_07_17_044557_create_posts_table.php` | `posts` |
| `2026_07_17_044558_create_post_tag_table.php` | `post_tag`（中間テーブル） |
| `2026_07_17_050701_create_personal_access_tokens_table.php` | `personal_access_tokens`（Sanctum） |

上4つ（users/cache/jobs系）はLaravel標準スケルトン。アプリ固有なのは `tags`, `posts`, `post_tag`, `personal_access_tokens`。

### カラム定義

**`users`**: `id`, `name`, `email`(unique), `email_verified_at`(nullable), `password`, `remember_token`, timestamps

**`tags`**: `id`, `name`(**unique**), timestamps

**`posts`**: `id`, `title`, `slug`(**unique**), `body`(text), `status`(string, default `'draft'`), timestamps

**`post_tag`**: `post_id`（FK, `cascadeOnDelete()`）, `tag_id`（FK, `cascadeOnDelete()`）, 複合主キー `[post_id, tag_id]`
→ Post/Tag削除時に中間レコードも自動削除。

**`personal_access_tokens`**（Sanctum標準）: `morphs('tokenable')`, `token`(unique,64), `abilities`, `last_used_at`, `expires_at`, timestamps

### モデル

```php
// app/Models/Post.php
#[Fillable(['title', 'slug', 'body', 'status'])]
class Post extends Model
{
    use HasFactory;
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
```

```php
// app/Models/Tag.php
#[Fillable(['name'])]
class Tag extends Model
{
    use HasFactory;
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class);
    }
}
```

```php
// app/Models/User.php
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

- `status` はDB上は単なるstring。PHP側もenum caseではなく文字列運用。
- Post⇔Tagは標準的な `belongsToMany`（pivotに追加カラム無し、中間テーブルモデルクラス無し）。

## 3. APIルート一覧（`routes/api.php`）

| メソッド | パス | コントローラー | ミドルウェア | 認証 |
|---|---|---|---|---|
| POST | `/api/login` | `AuthController::login` | なし | 不要 |
| GET | `/api/posts` | `PostController::index` | なし | 不要（公開記事のみ） |
| GET | `/api/posts/{slug}` | `PostController::show` | なし | 不要（公開記事のみ） |
| GET | `/api/tags` | `TagController::index` | なし | 不要 |
| GET | `/api/user` | クロージャ `fn($r) => $r->user()` | `auth:sanctum` | 必要 |
| POST | `/api/logout` | `AuthController::logout` | `auth:sanctum` | 必要 |
| `apiResource` | `/api/admin/posts[/{post}]` | `Admin\PostController` | `auth:sanctum` | 必要 |
| `apiResource` | `/api/admin/tags[/{tag}]` | `Admin\TagController` | `auth:sanctum` | 必要 |

`routes/web.php` はウェルカムページのみ、`routes/console.php` は標準の `inspire` コマンドのみで未使用。

ルートモデルバインディング利用（`Admin\PostController::show/update/destroy(Post $post)` 等）。存在しないIDは
`ModelNotFoundException` → 例外ハンドラで404に変換（後述）。

## 4. コントローラーのロジック

### `PostController`（公開用）
- `index()`: `status='published'` のみ、`with('tags')`、`latest('created_at')`。ページネーションなし（全件取得）。
- `show(slug)`: `status='published'` かつ `slug` 一致を `firstOrFail()`。下書き・不存在は404
  （下書きの詳細アクセスも404になる仕様がテストで明示）。

### `TagController`（公開用）
- `index()`: `orderBy('name')` の全件取得のみ。ページネーションなし。

### `AuthController`（Cookie認証版）
- `login()`: `$request->validate()` によるインラインバリデーション（FormRequest未使用）。
  `Auth::attempt($credentials)` でメール/パスワードを照合し、ユーザー不存在とパスワード誤りを区別しない
  （**ユーザー列挙攻撃対策**、失敗時は`ValidationException::withMessages(['email'=>[...]])`）。
  成功時は `$request->session()->regenerate()`（セッション固定化対策）を行い、
  `{user: {id, name, email}}` を返す。トークンは発行しない。
- `logout()`: `Auth::guard('web')->logout()` → `session()->invalidate()` → `session()->regenerateToken()`、
  `noContent()`(204)。

### `Admin\PostController`
- `index()`: ステータス問わず全件、`with('tags')`, `latest()`。ページネーションなし。
- `store()`: `Post::create($request->safe()->except('tag_ids'))` → `$post->tags()->sync($request->validated('tag_ids', []))`。
  作成時は自動的に201 Created。
- `show()`: バインディング取得 + `load('tags')`。
- `update()`: `$post->update($request->safe()->except('tag_ids'))`（`sometimes`ルールで部分更新）。
  **`if ($request->has('tag_ids'))` の場合のみタグをsync** — `tag_ids`を送らなければ既存タグは維持される仕様
  （テストで明示的に検証されている重要な挙動）。
- `destroy()`: `$post->delete()` → 204。中間テーブルはDB外部キーのカスケードで自動削除。

### `Admin\TagController`
- `index/store/show/update/destroy` はPostと同様のシンプルなCRUDパターン（sync等の関連操作なし）。

**検索/フィルタ/ページネーション**は公開・管理どちらのAPIにも実装なし（全件取得のみ）。タグによる記事フィルタも
API側には無く、フロントエンド側で全件取得後にフィルタしている。

## 5. バリデーション（`app/Http/Requests/Admin/`）

全FormRequest共通で `authorize(): bool { return true; }`（追加の権限チェック無し、認証済みであれば誰でも可）。

- **`StorePostRequest`**: `title`(required, string, max:25) / `slug`(required, string, max:25, `alpha_dash`,
  `Rule::unique('posts','slug')`) / `body`(required, string) / `status`(required, `Rule::in(['draft','published'])`) /
  `tag_ids`(nullable, array) / `tag_ids.*`(`Rule::exists('tags','id')`)
- **`UpdatePostRequest`**: 上記に `sometimes` を追加した部分更新版。`slug`一意制約は
  `->ignore($this->route('post'))` で自分自身を除外。
- **`StoreTagRequest`**: `name`(required, string, max:10, `Rule::unique('tags','name')`)
- **`UpdateTagRequest`**: 同上 + `->ignore($this->route('tag'))`

注目点: `title`/`slug`は最大**25文字**、タグ名は最大**10文字**という厳しめの制限。`slug`には`alpha_dash`
（英数字・ダッシュ・アンダースコアのみ）。

## 6. ミドルウェア・認可

- `app/Http/Middleware/` ディレクトリ自体が無し。すべて `bootstrap/app.php` の `withMiddleware()` で完結。
- 認可は `Policies` を使わず `auth:sanctum` による「ログイン済みか否か」のみ。ロール階層は無し
  （`User`にroleカラムも無い、意図的に単一管理者のまま維持）。
- **SPA Cookie認証**: `bootstrap/app.php` で `$middleware->statefulApi();` を有効化。これにより`api`
  ミドルウェアグループの先頭に`Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful`が挿入され、
  リクエストの`Origin`/`Referer`ヘッダーが`config('sanctum.stateful')`（`SANCTUM_STATEFUL_DOMAINS`環境変数）に
  登録されたホストと一致する場合のみ、Bearerトークンの代わりにセッションcookieで認証される
  （`EncryptCookies`, `StartSession`, `ValidateCsrfToken`, `AuthenticateSession`が動的に追加される）。
  一致しない場合は素のBearerトークン検証にフォールバックするが、現状トークンは発行していないため
  実質cookie認証のみ。
- `config/sanctum.php`を明示的に配置（デフォルトのvendorスタブと同一内容、`stateful`設定を有効にするために必須）。

## 7. 例外ハンドリング（404レスポンスの内部クラス名隠蔽）

`bootstrap/app.php` に集約:

```php
->withMiddleware(function (Middleware $middleware): void {
    // API専用アプリのため、未認証時にLaravelのデフォルトの'login'名前付きルートへ
    // リダイレクトさせず常に401 JSONを返す
    $middleware->redirectGuestsTo(fn () => null);
})
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(
        fn (Request $request) => $request->is('api/*'),
    );

    // ModelNotFoundExceptionはprepareException()でNotFoundHttpExceptionに変換された上でrenderされるため
    // ここで捕まえる。デフォルトのメッセージにモデルの内部クラス名がそのまま含まれるため隠す
    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json(['message' => 'Not Found.'], 404);
        }
    });
})->create();
```

- `ModelNotFoundException`（例: `App\Models\Post`が見つからない）はLaravel内部で`prepareException()`により
  `NotFoundHttpException`に変換されてからレンダリングされるため、**変換後の`NotFoundHttpException`をcatchする必要がある**
  という点がポイント。これにより `No query results for model [App\Models\Post] 5` のような内部情報漏洩を防ぎ、
  `{"message": "Not Found."}` に統一。
- `shouldRenderJsonWhen`で`api/*`パスは常にJSONレンダリングを強制。
- Job/Event/Listener/Observer/カスタムExceptionは存在しない。`AppServiceProvider`も空のボイラープレートのまま。

## 8. 設定（`config/`）

- **`config/cors.php`を明示的に配置**（以前は存在せずフレームワークのデフォルト`allowed_origins:['*']`,
  `supports_credentials:false`のままだった）。Cookie認証(`credentials: 'include'`)を使うため
  `supports_credentials: true`にし、ワイルドカードではなく`FRONTEND_URL`環境変数由来の
  明示的なオリジンのみ許可（credentials併用時はブラウザがワイルドカードオリジンを拒否するため必須）。
  `paths`には`api/*`に加え`sanctum/csrf-cookie`と`up`（ヘルスチェック）も含める。
- `config/filesystems.php`: `local`/`public`/`s3`の3ディスク定義があるが、Post/Tagに画像アップロード機能は無く未使用
  （将来拡張を見越した標準スケルトンのまま）。
- `config/database.php`: デフォルト`sqlite`。本番はPostgreSQL接続（`pdo_pgsql`拡張）。
- `config/session.php`: `SESSION_COOKIE`環境変数でcookie名を`blog_session`に固定
  （フロントエンドのProxy(`proxy.ts`)がcookieの有無を判定する際に名前を決め打ちできるようにするため）。
- `.env.example`に追加した環境変数: `FRONTEND_URL`（CORS許可オリジン）、`SANCTUM_STATEFUL_DOMAINS`
  （cookie認証を許可するフロントエンドのホスト、ポート込み）、`SESSION_DOMAIN`/`SESSION_SECURE_COOKIE`
  （フロントエンドと異なるサブドメインで本番運用する場合の設定）、`SESSION_COOKIE`。

## 9. デプロイ

**`Dockerfile`**（`php:8.4-fpm` + Nginx + Supervisor構成。以前は`php artisan serve`単体だったが、
本番向けにNginx/PHP-FPMへ切り替え済み）:
```dockerfile
FROM php:8.4-fpm
RUN apt-get update && apt-get install -y \
    libpq-dev libicu-dev libzip-dev unzip git nginx supervisor gettext-base \
    && docker-php-ext-install pdo_pgsql intl zip \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . .
RUN composer install --no-interaction --optimize-autoloader \
    && chown -R www-data:www-data storage bootstrap/cache
COPY docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
EXPOSE 8000
CMD ["sh", "start.sh"]
```
- `composer install`から`--no-dev`は**あえて外している**（`database/seeders/DatabaseSeeder.php`が
  `User::factory()`経由で`fakerphp/faker`（devパッケージ）の`fake()`ヘルパーに依存しており、
  `--no-dev`を付けると本番の初回シードが`Call to undefined function fake()`で失敗する）。
- `docker/nginx.conf.template`: `listen ${PORT};`を含むNginx設定テンプレート。`.php`は
  `127.0.0.1:9000`のPHP-FPMにfastcgi_passする一般的な構成。
- `docker/supervisord.conf`: `nginx`と`php-fpm`の2プロセスを1コンテナ内でフォアグラウンド起動・監視する
  supervisor設定（`autorestart=true`でプロセスが落ちても再起動）。

**`start.sh`**:
```sh
#!/bin/sh
set -e
php artisan migrate --force
php artisan db:seed --force || echo "Seeding skipped (already seeded or failed), continuing..."

export PORT=${PORT:-8000}
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
```
起動時に自動マイグレーション＋シード（失敗しても継続）。`envsubst`でNginx設定の`${PORT}`をRailway注入の
`PORT`（ローカルはデフォルト8000）に置換してから、supervisordでnginx+php-fpmを起動する。
ローカル(`docker-compose.yml`)でもこの同じDockerfileを使う（ソースはvolumeマウントされるため、
PHPファイルの変更はビルドし直さずに反映される＝`artisan serve`時代と同じ開発体験を維持）。

**`railway.toml`**:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/up"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```
`/up`はLaravel標準のヘルスチェックルート。障害時のみ再起動。

**`database/seeders/DatabaseSeeder.php`**: `ADMIN_EMAIL`/`ADMIN_PASSWORD`環境変数で管理者アカウント構成可能
（デフォルト `test@example.com` / `password`）。

**CI**（`.github/workflows/ci.yml`）: PHP 8.4セットアップ → composer install → `.env`生成 → `key:generate` →
`./vendor/bin/pint --test` → `php artisan test`（Pest）。`main`へのpush/PRで発火。

## 10. テスト（Pest, `tests/`）

`tests/Pest.php`で`RefreshDatabase`を`Feature`全体に適用、DBは`sqlite :memory:`。
Cookie認証への切り替えに伴い、`tests/Pest.php`に共通ヘルパー`fromFrontend(): array`
（`['Origin' => 'http://localhost:3000']`を返す）を追加。ログイン/ログアウトの実HTTPフローを検証するテストは
このヘッダーを付与しないと`EnsureFrontendRequestsAreStateful`がリクエストを「フロントエンドから」と
認識せずセッションが開始されないため、`Admin/*ControllerTest`（`Sanctum::actingAs()`でガードを直接偽装する
テスト）以外の`Auth/LoginTest`・`Auth/LogoutTest`ではこのヘルパーを使う。
また`assertGuest()`は引数無しだと`auth:sanctum`ミドルウェア通過後にデフォルトガードが`'sanctum'`
（`RequestGuard`）に切り替わり、かつそのガードがリクエスト内で解決結果をキャッシュしてしまうため、
ログアウト検証では`assertGuest('web')`のように実際にログアウト処理が行われる`'web'`ガードを明示する必要がある
（テスト特有のハマりどころ、本番の実リクエストでは無関係）。

- `Feature/PostControllerTest.php`（5テスト）: 公開記事のみ一覧に出る／タグ含む／slugで詳細取得／
  下書きの詳細は404／存在しないslugは404
- `Feature/TagControllerTest.php`（1テスト）: 名前順ソート確認
- `Feature/Admin/PostControllerTest.php`（9テスト）: 未ログイン401／下書き含め全件取得／作成+タグ紐付け／
  必須バリデーション／slug重複／status不正値／更新／**`tag_ids`未送信時はタグ維持**／削除
- `Feature/Admin/TagControllerTest.php`（7テスト）: 未ログイン401／作成／名前重複／10文字超過エラー／更新／
  自分自身との重複は許可／削除
- `Feature/Auth/LoginTest.php`（4テスト）: 正常ログイン／パスワード誤り（422, emailエラー）／
  存在しないメール（同様に422、列挙攻撃対策）／必須項目チェック
- `Feature/Auth/LogoutTest.php`（2テスト）: 認証済みユーザーはログアウトでき`'web'`ガードのセッションが
  破棄される／未ログインは401
- `Feature/ExampleTest.php`, `Unit/ExampleTest.php`: Laravel標準の未変更サンプル

全体的に、公開API・管理API・認証の3レイヤーそれぞれで正常系・バリデーションエラー・認可エラー・
エッジケースを丁寧にカバーした高品質なテストスイート。テスト名はすべて日本語。
