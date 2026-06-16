import type { MetadataRoute } from 'next'
import { api } from '@/lib/api'
import type { ApiResponse, Article } from '@/types'

const BASE_URL = 'https://frontend-production-167e.up.railway.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [{ url: BASE_URL, lastModified: new Date() }]

  try {
    const { data: articles } = await api.get<ApiResponse<Article[]>>('/articles')
    const articleEntries = articles.map((article) => ({
      url: `${BASE_URL}/articles/${article.slug}`,
      lastModified: article.updated_at,
    }))
    return [...home, ...articleEntries]
  } catch (error) {
    console.error('Failed to fetch articles for sitemap:', error)
    return home
  }
}
