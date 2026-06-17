import { api } from '@/lib/api'
import type { ApiResponse, Article, Tag } from '@/types'
import { PublicArticleList } from './_components/PublicArticleList'

export default async function Home() {
  let articles: Article[] = []
  let tags: Tag[] = []
  try {
    const [articlesRes, tagsRes] = await Promise.all([
      api.get<ApiResponse<Article[]>>('/articles', { next: { tags: ['articles'] } }),
      api.get<ApiResponse<Tag[]>>('/tags', { next: { tags: ['tags'] } }),
    ])
    articles = articlesRes.data
    tags = tagsRes.data
  } catch (error) {
    console.error('Failed to fetch articles or tags:', error)
  }

  return <PublicArticleList articles={articles} tags={tags} />
}
