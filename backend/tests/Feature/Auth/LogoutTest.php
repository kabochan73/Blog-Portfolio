<?php

use App\Models\User;

test('認証済みユーザーはログアウトでき、セッションが破棄される', function () {
    $user = User::factory()->create();

    $response = $this->withHeaders(fromFrontend())
        ->actingAs($user)
        ->postJson('/api/logout');

    $response->assertNoContent();

    // auth:sanctumミドルウェアを通ると既定ガードが'sanctum'に切り替わり、
    // 'sanctum'ガード(RequestGuard)は解決結果をリクエスト内でキャッシュしてしまうため、
    // ここでは実際にログアウト処理が行われる'web'ガードを明示して検証する。
    $this->assertGuest('web');
});

test('未ログインのユーザーはログアウトできない', function () {
    $this->withHeaders(fromFrontend())->postJson('/api/logout')->assertUnauthorized();
});
