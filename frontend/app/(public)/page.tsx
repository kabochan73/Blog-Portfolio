import { api } from '@/lib/api'
import type { ApiResponse, Article, Tag } from '@/types'
import { ArticleList } from './_components/ArticleList'
import { SearchSidebar } from './_components/SearchSidebar'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>
}) {
  const { q, tag } = await searchParams

  const [{ data: articles }, { data: tags }] = await Promise.all([
    api.get<ApiResponse<Article[]>>('/articles', { next: { tags: ['articles'] } }),
    api.get<ApiResponse<Tag[]>>('/tags', { next: { tags: ['tags'] } }),
  ])

  const selectedTag = tag ? Number(tag) : null

  const filtered = articles.filter((article) => {
    const matchesQuery = !q || article.title.toLowerCase().includes(q.toLowerCase())
    const matchesTag = !selectedTag || article.tags.some((t) => t.id === selectedTag)
    return matchesQuery && matchesTag
  })

  return (
    <div className="flex gap-8">
      <main className="flex-3 min-w-0">
        <ArticleList articles={filtered} selectedTag={selectedTag} query={q ?? ''} />
      </main>
      <SearchSidebar tags={tags} />
    </div>
  )
}
