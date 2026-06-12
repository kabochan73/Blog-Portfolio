<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminTagController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return TagResource::collection(Tag::orderBy('name')->get());
    }

    public function store(Request $request): TagResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'slug' => ['nullable', 'string', 'unique:tags,slug'],
        ]);

        $data['slug'] ??= Str::slug($data['name']) ?: Str::uuid()->toString();

        return new TagResource(Tag::create($data));
    }

    public function update(Request $request, Tag $tag): TagResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:50'],
            'slug' => ['sometimes', 'string', Rule::unique('tags', 'slug')->ignore($tag)],
        ]);

        $tag->update($data);

        return new TagResource($tag);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        return response()->json(null, 204);
    }
}
