<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::query()
            ->where('status', 'published')
            ->with('tags')
            ->latest('created_at')
            ->get();

        return PostResource::collection($posts);
    }

    public function show(string $slug)
    {
        $post = Post::query()
            ->where('status', 'published')
            ->where('slug', $slug)
            ->with('tags')
            ->firstOrFail();

        return new PostResource($post);
    }
}
