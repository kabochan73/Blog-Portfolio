<?php

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('未ログインでは管理用の記事APIにアクセスできない', function () {
    $this->getJson('/api/admin/posts')->assertUnauthorized();
});

test('一覧は下書きを含む全ての記事を返す', function () {
    Sanctum::actingAs(User::factory()->create());
    Post::factory()->create();
    Post::factory()->draft()->create();

    $this->getJson('/api/admin/posts')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('作成すると記事が保存されタグも紐づく', function () {
    Sanctum::actingAs(User::factory()->create());
    $tags = Tag::factory()->count(2)->create();

    $response = $this->postJson('/api/admin/posts', [
        'title' => '新しい記事',
        'slug' => 'new-post',
        'body' => '本文',
        'status' => 'draft',
        'tag_ids' => $tags->pluck('id')->all(),
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.slug', 'new-post')
        ->assertJsonCount(2, 'data.tags');

    $this->assertDatabaseHas('posts', ['slug' => 'new-post', 'status' => 'draft']);
});

test('作成には必須項目のバリデーションがある', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/admin/posts', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'slug', 'body', 'status']);
});

test('slugが重複していると作成できない', function () {
    Sanctum::actingAs(User::factory()->create());
    Post::factory()->create(['slug' => 'taken']);

    $this->postJson('/api/admin/posts', [
        'title' => '別の記事',
        'slug' => 'taken',
        'body' => '本文',
        'status' => 'draft',
    ])->assertUnprocessable()->assertJsonValidationErrors('slug');
});

test('statusが不正な値だと作成できない', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/admin/posts', [
        'title' => '別の記事',
        'slug' => 'another',
        'body' => '本文',
        'status' => 'archived',
    ])->assertUnprocessable()->assertJsonValidationErrors('status');
});

test('更新すると記事の内容が変わる', function () {
    Sanctum::actingAs(User::factory()->create());
    $post = Post::factory()->create(['title' => '古いタイトル']);

    $this->putJson("/api/admin/posts/{$post->id}", [
        'title' => '新しいタイトル',
    ])->assertOk()->assertJsonPath('data.title', '新しいタイトル');

    $this->assertDatabaseHas('posts', ['id' => $post->id, 'title' => '新しいタイトル']);
});

test('tag_idsを送った時だけタグが差し替わる', function () {
    Sanctum::actingAs(User::factory()->create());
    $post = Post::factory()->create();
    $originalTag = Tag::factory()->create();
    $post->tags()->attach($originalTag);

    $this->putJson("/api/admin/posts/{$post->id}", [
        'title' => $post->title,
    ])->assertOk();

    expect($post->fresh()->tags)->toHaveCount(1);

    $newTag = Tag::factory()->create();
    $this->putJson("/api/admin/posts/{$post->id}", [
        'tag_ids' => [$newTag->id],
    ])->assertOk();

    expect($post->fresh()->tags->pluck('id')->all())->toBe([$newTag->id]);
});

test('削除すると記事がDBから消える', function () {
    Sanctum::actingAs(User::factory()->create());
    $post = Post::factory()->create();

    $this->deleteJson("/api/admin/posts/{$post->id}")->assertNoContent();

    $this->assertDatabaseMissing('posts', ['id' => $post->id]);
});
