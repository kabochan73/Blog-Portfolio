import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import type { ApiResponse, Article, Tag } from '@/types'
import { AdminArticleList } from './AdminArticleList'

export default async function AdminArticlesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  const [{ data: articles }, { data: tags }] = await Promise.all([
    api.get<ApiResponse<Article[]>>('/admin/articles?status=published', { token, cache: 'no-store' }),
    api.get<ApiResponse<Tag[]>>('/tags', { token, cache: 'no-store' }),
  ])

  return <AdminArticleList articles={articles} tags={tags} />
}
