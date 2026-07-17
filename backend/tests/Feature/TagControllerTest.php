<?php

use App\Models\Tag;

test('一覧はタグを名前順で返す', function () {
    Tag::factory()->create(['name' => 'zzz']);
    Tag::factory()->create(['name' => 'aaa']);

    $response = $this->getJson('/api/tags');

    $response->assertOk()
        ->assertJsonPath('data.0.name', 'aaa')
        ->assertJsonPath('data.1.name', 'zzz');
});
