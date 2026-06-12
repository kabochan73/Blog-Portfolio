<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use RefreshDatabase;

    // --- Public ---

    public function test_public_index_returns_only_published_articles(): void
    {
        Article::factory()->published()->count(2)->create();
        Article::factory()->count(1)->create(); // draft

        $this->getJson('/api/articles')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_public_show_returns_published_article_by_slug(): void
    {
        $article = Article::factory()->published()->create();

        $this->getJson("/api/articles/{$article->slug}")
            ->assertOk()
            ->assertJsonPath('data.slug', $article->slug);
    }

    public function test_public_show_returns_404_for_draft(): void
    {
        $article = Article::factory()->create(); // draft

        $this->getJson("/api/articles/{$article->slug}")->assertNotFound();
    }

    // --- Admin ---

    private function actingAsAdmin(): static
    {
        return $this->withToken(User::factory()->create()->createToken('admin')->plainTextToken);
    }

    public function test_admin_index_returns_all_articles(): void
    {
        Article::factory()->published()->count(2)->create();
        Article::factory()->count(1)->create(); // draft

        $this->actingAsAdmin()
            ->getJson('/api/admin/articles')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_index_filters_by_status(): void
    {
        Article::factory()->published()->count(2)->create();
        Article::factory()->count(1)->create();

        $this->actingAsAdmin()
            ->getJson('/api/admin/articles?status=draft')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_store_creates_article(): void
    {
        $tag = Tag::factory()->create();

        $this->actingAsAdmin()
            ->postJson('/api/admin/articles', [
                'title'   => 'Test Article',
                'content' => 'Content here',
                'status'  => 'draft',
                'tags'    => [$tag->id],
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Test Article');
    }

    public function test_admin_store_requires_auth(): void
    {
        $this->postJson('/api/admin/articles', [
            'title'   => 'Test',
            'content' => 'Content',
            'status'  => 'draft',
        ])->assertUnauthorized();
    }

    public function test_admin_update_modifies_article(): void
    {
        $article = Article::factory()->create();

        $this->actingAsAdmin()
            ->patchJson("/api/admin/articles/{$article->id}", ['title' => 'Updated'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated');
    }

    public function test_admin_destroy_deletes_article(): void
    {
        $article = Article::factory()->create();

        $this->actingAsAdmin()
            ->deleteJson("/api/admin/articles/{$article->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('articles', ['id' => $article->id]);
    }
}
