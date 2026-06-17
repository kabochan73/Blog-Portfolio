'use client'

import { useState } from 'react'
import type { Article, Tag } from '@/types'
import { ArticleCard } from '@/app/_components/ArticleCard'
import { FilterSidebar } from '@/app/_components/FilterSidebar'
import { deleteArticle } from '../articles/actions'

type Props = {
  articles: Article[]
  tags: Tag[]
  emptyText?: string
  placeholder?: string
  dateField?: 'published_at' | 'created_at'
}

export function AdminArticleList({
  articles,
  tags,
  emptyText = '記事がまだありません。',
  placeholder = '記事を検索...',
  dateField = 'published_at',
}: Props) {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<number | null>(null)

  const filtered = articles.filter((article) => {
    const matchesQuery = article.title.toLowerCase().includes(query.toLowerCase())
    const matchesTag = selectedTag === null || article.tags.some((t) => t.id === selectedTag)
    return matchesQuery && matchesTag
  })

  const handleTagClick = (tagId: number) => {
    setSelectedTag((prev) => (prev === tagId ? null : tagId))
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-8">
      <div className="md:w-56 md:shrink-0 md:sticky md:top-8 md:self-start">
        <FilterSidebar
          query={query}
          selectedTag={selectedTag}
          tags={tags}
          placeholder={placeholder}
          onQueryChange={setQuery}
          onTagClick={handleTagClick}
        />
      </div>
      <main className="min-w-0 md:flex-3 md:order-first">
        {filtered.length === 0 ? (
          <p className="text-gray-500">
            {query || selectedTag ? '条件に一致する記事がありません。' : emptyText}
          </p>
        ) : (
          <ul className="space-y-6">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                href={`/dashboard/articles/${article.id}/edit`}
                dateField={dateField}
                renderTag={(tag) => (
                  <button
                    onClick={() => handleTagClick(tag.id)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selectedTag === tag.id
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                )}
                actions={
                  <form action={deleteArticle.bind(null, article.id)}>
                    <button type="submit" className="text-sm text-red-600 hover:underline">
                      削除
                    </button>
                  </form>
                }
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
