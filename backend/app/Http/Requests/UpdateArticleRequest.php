<?php

namespace App\Http\Requests;

use App\Enums\ArticleStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateArticleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => ['sometimes', 'string', 'max:50'],
            'content'      => ['sometimes', 'string'],
            'slug'         => ['sometimes', 'string', Rule::unique('articles', 'slug')->ignore($this->article)],
            'status'       => ['sometimes', Rule::enum(ArticleStatus::class)],
            'published_at' => ['nullable', 'date'],
            'tags'         => ['nullable', 'array'],
            'tags.*'       => ['integer', 'exists:tags,id'],
        ];
    }
}
