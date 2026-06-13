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
    <div className="flex gap-8">
      <main className="flex-3 min-w-0">
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
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tag.name}
                  </span>
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
      <div className="flex-1 shrink-0 sticky top-8 self-start">
        <FilterSidebar
          query={query}
          selectedTag={selectedTag}
          tags={tags}
          placeholder={placeholder}
          onQueryChange={setQuery}
          onTagClick={handleTagClick}
        />
      </div>
    </div>
  )
}
