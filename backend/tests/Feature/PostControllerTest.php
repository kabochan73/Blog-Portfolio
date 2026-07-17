<?php

use App\Models\Post;
use App\Models\Tag;

test('一覧は公開済みの記事のみ返す', function () {
    $published = Post::factory()->create(['title' => 'Published']);
    Post::factory()->draft()->create(['title' => 'Draft']);

    $response = $this->getJson('/api/posts');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', $published->slug);
});

test('一覧には各記事のタグが含まれる', function () {
    $post = Post::factory()->create();
    $tag = Tag::factory()->create();
    $post->tags()->attach($tag);

    $response = $this->getJson('/api/posts');

    $response->assertOk()
        ->assertJsonPath('data.0.tags.0.id', $tag->id);
});

test('詳細はslugを指定して公開済みの記事を返す', function () {
    $post = Post::factory()->create();

    $response = $this->getJson("/api/posts/{$post->slug}");

    $response->assertOk()
        ->assertJsonPath('data.slug', $post->slug);
});

test('下書き記事の詳細は404になる', function () {
    $post = Post::factory()->draft()->create();

    $this->getJson("/api/posts/{$post->slug}")->assertNotFound();
});

test('存在しないslugの詳細は404になる', function () {
    $this->getJson('/api/posts/does-not-exist')->assertNotFound();
});
