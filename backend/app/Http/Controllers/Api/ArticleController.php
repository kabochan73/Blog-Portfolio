<?php

namespace App\Http\Controllers\Api;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ArticleController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $articles = Article::with('tags')
            ->where('status', ArticleStatus::Published->value)
            ->orderByDesc('published_at')
            ->get();

        return ArticleResource::collection($articles);
    }

    public function show(string $slug): ArticleResource
    {
        $article = Article::with('tags')
            ->where('status', ArticleStatus::Published->value)
            ->where('slug', $slug)
            ->firstOrFail();

        return new ArticleResource($article);
    }
}
