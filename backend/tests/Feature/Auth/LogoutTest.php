<?php

use App\Models\User;

test('認証済みユーザーはログアウトでき、トークンが失効する', function () {
    $user = User::factory()->create();
    $token = $user->createToken('admin');

    $response = $this->withHeader('Authorization', "Bearer {$token->plainTextToken}")
        ->postJson('/api/logout');

    $response->assertNoContent();

    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
});

test('未ログインのユーザーはログアウトできない', function () {
    $this->postJson('/api/logout')->assertUnauthorized();
});
