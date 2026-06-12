<?php

namespace App\Models;

use App\Enums\ArticleStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['title', 'content', 'slug', 'status', 'published_at'])]
class Article extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => ArticleStatus::class,
            'published_at' => 'datetime',
        ];
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
