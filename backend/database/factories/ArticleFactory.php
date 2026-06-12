<?php

namespace Database\Factories;

use App\Enums\ArticleStatus;
use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'title'        => $title,
            'content'      => fake()->paragraphs(3, true),
            'slug'         => Str::slug($title) . '-' . fake()->unique()->numberBetween(1, 9999),
            'status'       => ArticleStatus::Draft,
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state([
            'status'       => ArticleStatus::Published,
            'published_at' => now(),
        ]);
    }
}
