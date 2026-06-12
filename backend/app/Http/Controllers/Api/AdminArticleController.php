<?php

namespace App\Http\Controllers\Api;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class AdminArticleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Article::with('tags')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return ArticleResource::collection($query->get());
    }

    public function show(Article $article): ArticleResource
    {
        return new ArticleResource($article->load('tags'));
    }

    public function store(StoreArticleRequest $request): ArticleResource
    {
        $data = $request->validated();
        $data['slug'] ??= Str::slug($data['title']) ?: Str::uuid()->toString();

        if ($data['status'] === ArticleStatus::Published->value && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $article = Article::create($data);
        $article->tags()->sync($data['tags'] ?? []);

        return new ArticleResource($article->load('tags'));
    }

    public function update(UpdateArticleRequest $request, Article $article): ArticleResource
    {
        $data = $request->validated();

        if (isset($data['status'])
            && $data['status'] === ArticleStatus::Published->value
            && empty($article->published_at)
            && empty($data['published_at'])
        ) {
            $data['published_at'] = now();
        }

        $article->update($data);

        if (array_key_exists('tags', $data)) {
            $article->tags()->sync($data['tags'] ?? []);
        }

        return new ArticleResource($article->load('tags'));
    }

    public function destroy(Article $article): JsonResponse
    {
        $article->delete();

        return response()->json(null, 204);
    }
}
