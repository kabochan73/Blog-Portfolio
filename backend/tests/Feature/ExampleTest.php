<?php

test('トップページにアクセスすると200が返る', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
