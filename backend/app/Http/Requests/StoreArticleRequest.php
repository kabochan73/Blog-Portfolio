<?php

namespace App\Http\Requests;

use App\Enums\ArticleStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArticleRequest extends FormRequest
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
            'title'        => ['required', 'string', 'max:50'],
            'content'      => ['required', 'string'],
            'slug'         => ['nullable', 'string', 'unique:articles,slug'],
            'status'       => ['required', Rule::enum(ArticleStatus::class)],
            'published_at' => ['nullable', 'date'],
            'tags'         => ['nullable', 'array'],
            'tags.*'       => ['integer', 'exists:tags,id'],
        ];
    }
}
