<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('正しい認証情報でログインできる', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->withHeaders(fromFrontend())->postJson('/api/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['user' => ['id', 'name', 'email']])
        ->assertJsonPath('user.id', $user->id);

    $this->assertAuthenticatedAs($user);
});

test('パスワードが間違っているとログインに失敗する', function () {
    User::factory()->create([
        'email' => 'admin@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->withHeaders(fromFrontend())->postJson('/api/login', [
        'email' => 'admin@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    $this->assertGuest();
});

test('存在しないメールアドレスではログインに失敗する', function () {
    $response = $this->withHeaders(fromFrontend())->postJson('/api/login', [
        'email' => 'nobody@example.com',
        'password' => 'password',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    $this->assertGuest();
});

test('メールアドレスとパスワードは必須である', function () {
    $response = $this->withHeaders(fromFrontend())->postJson('/api/login', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password']);
});
