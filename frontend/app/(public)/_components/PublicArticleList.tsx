'use client'

import { useState } from 'react'
import type { Article, Tag } from '@/types'
import { FilterSidebar } from '@/app/_components/FilterSidebar'
import { ArticleList } from './ArticleList'

type Props = {
  articles: Article[]
  tags: Tag[]
}

export function PublicArticleList({ articles, tags }: Props) {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<number | null>(null)

  const filtered = articles.filter((article) => {
    const matchesQuery = !query || article.title.toLowerCase().includes(query.toLowerCase())
    const matchesTag = !selectedTag || article.tags.some((t) => t.id === selectedTag)
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
          onQueryChange={setQuery}
          onTagClick={handleTagClick}
        />
      </div>
      <main className="min-w-0 md:flex-3 md:order-first">
        <ArticleList
          articles={filtered}
          selectedTag={selectedTag}
          query={query}
          onTagClick={handleTagClick}
        />
      </main>
    </div>
  )
}
