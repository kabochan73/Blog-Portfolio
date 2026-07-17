<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePostRequest;
use App\Http\Requests\Admin\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::query()->with('tags')->latest()->get();

        return PostResource::collection($posts);
    }

    public function store(StorePostRequest $request)
    {
        $post = Post::create($request->safe()->except('tag_ids'));
        $post->tags()->sync($request->validated('tag_ids', []));

        return new PostResource($post->load('tags'));
    }

    public function show(Post $post)
    {
        return new PostResource($post->load('tags'));
    }

    public function update(UpdatePostRequest $request, Post $post)
    {
        $post->update($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $post->tags()->sync($request->validated('tag_ids', []));
        }

        return new PostResource($post->load('tags'));
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return response()->noContent();
    }
}
