<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class)->in('Feature');
uses(TestCase::class)->in('Unit');

// Sanctum SPA cookie認証は、Origin/Refererヘッダーがsanctum.statefulに
// 含まれるドメインからのリクエストのみセッションを使う対象とみなす。
function fromFrontend(): array
{
    return ['Origin' => 'http://localhost:3000'];
}
