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

  let articles: Article[] = []
  let tags: Tag[] = []

  try {
    const [articlesRes, tagsRes] = await Promise.all([
      api.get<ApiResponse<Article[]>>('/articles', { next: { tags: ['articles'] } }),
      api.get<ApiResponse<Tag[]>>('/tags', { next: { tags: ['tags'] } }),
    ])
    articles = articlesRes.data
    tags = tagsRes.data
  } catch (err) {
    console.error('Failed to fetch data:', err)
  }

  const selectedTag = tag ? Number(tag) : null

  const filtered = articles?.filter((article) => {
    const matchesQuery = !q || article.title.toLowerCase().includes(q.toLowerCase())
    const matchesTag = !selectedTag || article.tags.some((t) => t.id === selectedTag)
    return matchesQuery && matchesTag
  })

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-8">
      <SearchSidebar tags={tags} />
      <main className="min-w-0 md:flex-3 md:order-first">
        <ArticleList articles={filtered} selectedTag={selectedTag} query={q ?? ''} />
      </main>
    </div>
  )
}
