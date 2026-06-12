<?php

namespace Tests\Feature;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): static
    {
        return $this->withToken(User::factory()->create()->createToken('admin')->plainTextToken);
    }

    public function test_public_index_returns_all_tags(): void
    {
        Tag::factory()->count(3)->create();

        $this->getJson('/api/tags')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_index_returns_all_tags(): void
    {
        Tag::factory()->count(3)->create();

        $this->actingAsAdmin()
            ->getJson('/api/admin/tags')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_store_creates_tag(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/admin/tags', ['name' => 'Laravel'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Laravel');
    }

    public function test_admin_store_generates_slug_automatically(): void
    {
        $response = $this->actingAsAdmin()
            ->postJson('/api/admin/tags', ['name' => 'Next JS'])
            ->assertCreated();

        $this->assertSame('next-js', $response->json('data.slug'));
    }

    public function test_admin_store_requires_auth(): void
    {
        $this->postJson('/api/admin/tags', ['name' => 'Laravel'])->assertUnauthorized();
    }

    public function test_admin_update_modifies_tag(): void
    {
        $tag = Tag::factory()->create();

        $this->actingAsAdmin()
            ->patchJson("/api/admin/tags/{$tag->id}", ['name' => 'Updated'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated');
    }

    public function test_admin_destroy_deletes_tag(): void
    {
        $tag = Tag::factory()->create();

        $this->actingAsAdmin()
            ->deleteJson("/api/admin/tags/{$tag->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
    }
}
