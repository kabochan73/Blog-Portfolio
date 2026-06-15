<?php

namespace Database\Seeders;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample tags
        $tagData = [
            ['name' => 'Laravel',         'slug' => 'laravel'],
            ['name' => 'PHP',             'slug' => 'php'],
            ['name' => 'Web Development', 'slug' => 'web-development'],
            ['name' => 'Database',        'slug' => 'database'],
            ['name' => 'API Design',      'slug' => 'api-design'],
        ];

        $tags = collect($tagData)->map(
            fn (array $data) => Tag::firstOrCreate(['slug' => $data['slug']], $data)
        );

        // Create sample articles
        $articles = [
            [
                'title'        => 'Getting Started with Laravel 11',
                'slug'         => 'getting-started-with-laravel-11',
                'status'       => ArticleStatus::Published,
                'published_at' => now()->subDays(10),
                'content'      => <<<'MD'
Laravel 11 introduces a streamlined application skeleton that removes a significant amount of boilerplate, making new projects leaner and easier to navigate. The default directory structure has been trimmed down — middleware, service providers, and exception handlers are now configured in a single `bootstrap/app.php` file rather than scattered across multiple classes.

One of the most exciting additions is the new `Health` routing feature, which exposes a `/up` endpoint out of the box so your infrastructure can verify the application is running without any extra code. Pair this with the revamped `Schedule` and `Queue` facades and you have a solid foundation for building robust background-processing pipelines.

Getting started is as simple as running `composer create-project laravel/laravel my-app` and following the updated documentation. Whether you are building a REST API, a full-stack application with Blade, or a headless backend for a JavaScript frontend, Laravel 11 gives you the tools to move fast without sacrificing maintainability.
MD,
                'tags'         => ['laravel', 'php', 'web-development'],
            ],
            [
                'title'        => 'Designing RESTful APIs with Laravel Sanctum',
                'slug'         => 'designing-restful-apis-with-laravel-sanctum',
                'status'       => ArticleStatus::Published,
                'published_at' => now()->subDays(7),
                'content'      => <<<'MD'
Building a secure, token-based API in Laravel is straightforward with Sanctum. Unlike Passport, which implements the full OAuth2 specification, Sanctum focuses on the two most common use cases: SPA authentication via session cookies and mobile/third-party authentication via plain API tokens. This keeps the setup minimal while still covering the vast majority of real-world requirements.

To get started, install the package with `composer require laravel/sanctum`, publish the configuration, and run the migrations. Protecting a route is then as simple as adding the `auth:sanctum` middleware. Tokens can be created with `$user->createToken('device-name')->plainTextToken` and revoked individually or all at once, giving you fine-grained control over active sessions.

When designing your endpoints, follow REST conventions: use nouns for resource names, HTTP verbs for actions, and return consistent JSON structures with appropriate status codes. Combining these conventions with Sanctum's lightweight authentication layer results in an API that is both easy to consume and straightforward to secure.
MD,
                'tags'         => ['laravel', 'api-design', 'web-development'],
            ],
            [
                'title'        => 'PostgreSQL Performance Tips for PHP Developers',
                'slug'         => 'postgresql-performance-tips-for-php-developers',
                'status'       => ArticleStatus::Published,
                'published_at' => now()->subDays(4),
                'content'      => <<<'MD'
PostgreSQL is one of the most capable open-source relational databases available, but getting the best performance out of it requires understanding a few key concepts. The query planner is your best friend: use `EXPLAIN ANALYZE` to inspect execution plans and identify sequential scans that should be index scans instead.

Indexes are the single biggest lever for read performance. A B-tree index on a foreign key or a frequently filtered column can reduce query time from seconds to milliseconds. For full-text search, PostgreSQL's built-in `tsvector` and `tsquery` types let you avoid a dedicated search engine for many use cases. In Laravel, you can leverage these through raw expressions or the `whereFullText` method introduced in recent versions.

On the write side, batching inserts with `Model::insert([...])` instead of looping over `Model::create()` dramatically reduces round-trips. Connection pooling via PgBouncer is worth considering once your application scales beyond a handful of concurrent users, as PHP's share-nothing model means each request opens a fresh connection by default.
MD,
                'tags'         => ['database', 'php', 'web-development'],
            ],
            [
                'title'        => 'Eloquent Relationships Deep Dive',
                'slug'         => 'eloquent-relationships-deep-dive',
                'status'       => ArticleStatus::Published,
                'published_at' => now()->subDays(2),
                'content'      => <<<'MD'
Eloquent's relationship system is one of Laravel's most powerful features, abstracting away the SQL joins and pivot tables that would otherwise clutter your code. Understanding the difference between `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`, and the polymorphic variants is essential for modelling real-world domains cleanly.

Eager loading with `with()` is critical for avoiding the N+1 query problem. Whenever you iterate over a collection and access a relationship inside the loop, you risk firing one query per model. Replacing `Article::all()` with `Article::with('tags')->get()` collapses that into two queries regardless of how many articles exist.

For pivot tables, Eloquent provides `attach`, `detach`, `sync`, and `toggle` methods that handle the intermediate table transparently. You can also add extra columns to the pivot by defining them in `withPivot()` on the relationship and accessing them via `$model->pivot->column_name`. These small details make Eloquent a joy to work with once you know where to look.
MD,
                'tags'         => ['laravel', 'database', 'php'],
            ],
            [
                'title'        => 'Building a Blog API: From Migrations to Deployment',
                'slug'         => 'building-a-blog-api-from-migrations-to-deployment',
                'status'       => ArticleStatus::Published,
                'published_at' => now()->subDay(),
                'content'      => <<<'MD'
A blog API is the perfect project for learning the full Laravel development lifecycle. Start with migrations to define your schema — articles, tags, and a pivot table for the many-to-many relationship — then build Eloquent models with the appropriate relationships and fillable attributes. Resource controllers and API routes keep the structure conventional and easy for other developers to navigate.

Validation belongs in Form Request classes rather than inline in controllers. This keeps controllers thin and makes it trivial to reuse the same rules across multiple endpoints. Pair validation with API Resources to transform your models into consistent JSON responses, hiding internal implementation details like raw timestamps or sensitive fields.

For deployment, a Dockerfile that installs Composer dependencies, runs `php artisan migrate --force`, and serves the application via Octane or a traditional PHP-FPM setup gives you a reproducible, container-friendly artifact. Add a health check endpoint, wire up your environment variables, and you have a production-ready API that is straightforward to maintain and scale.
MD,
                'tags'         => ['laravel', 'api-design', 'database', 'web-development'],
            ],
        ];

        $tagsBySlug = $tags->keyBy('slug');

        foreach ($articles as $data) {
            $tagSlugs = $data['tags'];
            unset($data['tags']);

            $article = Article::firstOrCreate(
                ['slug' => $data['slug']],
                $data
            );

            $tagIds = collect($tagSlugs)
                ->map(fn (string $slug) => $tagsBySlug->get($slug)?->id)
                ->filter()
                ->values()
                ->all();

            $article->tags()->sync($tagIds);
        }
    }
}
