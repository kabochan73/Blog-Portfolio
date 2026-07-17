<?php

use App\Models\Tag;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('未ログインでは管理用のタグAPIにアクセスできない', function () {
    $this->getJson('/api/admin/tags')->assertUnauthorized();
});

test('作成するとタグが保存される', function () {
    Sanctum::actingAs(User::factory()->create());

    $response = $this->postJson('/api/admin/tags', ['name' => '日記']);

    $response->assertCreated()
        ->assertJsonPath('data.name', '日記');

    $this->assertDatabaseHas('tags', ['name' => '日記']);
});

test('名前が重複していると作成できない', function () {
    Sanctum::actingAs(User::factory()->create());
    Tag::factory()->create(['name' => '日記']);

    $this->postJson('/api/admin/tags', ['name' => '日記'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');
});

test('名前が10文字を超えると作成できない', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/admin/tags', ['name' => 'あいうえおかきくけこさ'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');
});

test('更新するとタグの名前が変わる', function () {
    Sanctum::actingAs(User::factory()->create());
    $tag = Tag::factory()->create(['name' => '旧名']);

    $this->putJson("/api/admin/tags/{$tag->id}", ['name' => '新名'])
        ->assertOk()
        ->assertJsonPath('data.name', '新名');
});

test('更新時に自分自身の名前とは重複していても許可される', function () {
    Sanctum::actingAs(User::factory()->create());
    $tag = Tag::factory()->create(['name' => '同じ名前']);

    $this->putJson("/api/admin/tags/{$tag->id}", ['name' => '同じ名前'])
        ->assertOk();
});

test('削除するとタグがDBから消える', function () {
    Sanctum::actingAs(User::factory()->create());
    $tag = Tag::factory()->create();

    $this->deleteJson("/api/admin/tags/{$tag->id}")->assertNoContent();

    $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
});
